import { Platform } from 'react-native';
import RNCallKeep, { IOptions } from 'react-native-callkeep';
import { RTCPeerConnection, RTCSessionDescription, mediaDevices, RTCIceCandidate, RTCIceCandidateInit } from 'react-native-webrtc';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { v4 as uuid } from 'uuid';
import type { CallSession, CallStatus, CallType } from '../types';
import { logCall } from './firestoreService';

const CALL_SESSIONS_COLLECTION = 'callSessions';

let peerConnection: RTCPeerConnection | null = null;
let localStream: MediaStream | null = null;
let remoteStream: MediaStream | null = null;
let currentCallId: string | null = null;

const rtcConfiguration: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export const initializeCallKeep = () => {
  const options: IOptions = {
    ios: {
      appName: 'WhatsApp Chat',
    },
    android: {
      alertTitle: 'Permissions required',
      alertDescription: 'This application needs to access your phone accounts',
      cancelButton: 'Cancel',
      okButton: 'ok',
    },
  };

  RNCallKeep.setup(options);
  RNCallKeep.setAvailable(true);
};

export const createPeerConnection = async (): Promise<RTCPeerConnection> => {
  if (peerConnection) return peerConnection;

  peerConnection = new RTCPeerConnection(rtcConfiguration);

  peerConnection.onicecandidate = (event) => {
    if (event.candidate && currentCallId) {
      addIceCandidate(currentCallId, event.candidate.toJSON());
    }
  };

  peerConnection.ontrack = (event) => {
    remoteStream = event.streams[0];
  };

  localStream = await mediaDevices.getUserMedia({
    audio: true,
    video: true,
  });

  localStream.getTracks().forEach((track) => {
    peerConnection?.addTrack(track, localStream as MediaStream);
  });

  return peerConnection;
};

export const startCall = async (
  callerId: string,
  calleeIds: string[],
  chatId: string,
  callType: CallType
): Promise<string> => {
  const callId = uuid();
  currentCallId = callId;
  const connection = await createPeerConnection();

  const offer = await connection.createOffer({
    offerToReceiveAudio: true,
    offerToReceiveVideo: callType === 'video',
  });
  await connection.setLocalDescription(new RTCSessionDescription(offer));

  await firestore()
    .collection(CALL_SESSIONS_COLLECTION)
    .doc(callId)
    .set({
      callId,
      chatId,
      callerId,
      calleeIds,
      callType,
      status: 'ringing',
      offer,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });

  RNCallKeep.startCall(callId, calleeIds[0], calleeIds[0], callType === 'video');

  return callId;
};

export const listenForIncomingCalls = (
  userId: string,
  onIncomingCall: (call: CallSession, extra: { answer: () => Promise<void>; decline: () => Promise<void> }) => void
): (() => void) => {
  return firestore()
    .collection(CALL_SESSIONS_COLLECTION)
    .where('calleeIds', 'array-contains', userId)
    .onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          currentCallId = data.callId;
          const callSession: CallSession = {
            callId: data.callId,
            chatId: data.chatId,
            callerId: data.callerId,
            calleeIds: data.calleeIds,
            callType: data.callType,
            status: data.status,
            startedAt: data.startedAt,
          };

          const answer = async () => {
            if (!peerConnection) {
              await createPeerConnection();
            }

            const connection = peerConnection as RTCPeerConnection;
            await connection.setRemoteDescription(new RTCSessionDescription(data.offer));

            const answerDescription = await connection.createAnswer();
            await connection.setLocalDescription(answerDescription);

            await firestore()
              .collection(CALL_SESSIONS_COLLECTION)
              .doc(data.callId)
              .update({
                answer: answerDescription,
                status: 'active',
                answeredAt: firestore.FieldValue.serverTimestamp(),
              });

            RNCallKeep.answerIncomingCall(data.callId);
          };

          const decline = async () => {
            await firestore()
              .collection(CALL_SESSIONS_COLLECTION)
              .doc(data.callId)
              .update({
                status: 'declined',
                endedAt: firestore.FieldValue.serverTimestamp(),
              });

            RNCallKeep.endCall(data.callId);
          };

          onIncomingCall(callSession, { answer, decline });
        }

        if (change.type === 'modified') {
          const data = change.doc.data();
          const connection = peerConnection;
          if (data.answer && connection) {
            connection.setRemoteDescription(new RTCSessionDescription(data.answer));
          }

          if (data.iceCandidates && connection) {
            data.iceCandidates.forEach((candidate: RTCIceCandidateInit) => {
              connection.addIceCandidate(new RTCIceCandidate(candidate));
            });
          }

          if (data.status === 'ended' || data.status === 'declined' || data.status === 'failed' || data.status === 'missed') {
            teardownCall();
          }
        }
      });
    });
};

export const addIceCandidate = async (callId: string, candidate: RTCIceCandidateInit) => {
  await firestore()
    .collection(CALL_SESSIONS_COLLECTION)
    .doc(callId)
    .set(
      {
        iceCandidates: firestore.FieldValue.arrayUnion(candidate),
      },
      { merge: true }
    );
};

export const endCall = async (
  callId: string,
  chatId: string,
  status: CallStatus,
  participants: string[],
  durationSeconds?: number,
  callType: CallType = 'voice'
) => {
  await firestore()
    .collection(CALL_SESSIONS_COLLECTION)
    .doc(callId)
    .set(
      {
        status,
        endedAt: firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

  await logCall(
    chatId,
    {
      callId,
      callType,
      status,
      startedAt: firestore.Timestamp.now(),
      endedAt: firestore.Timestamp.now(),
      durationSeconds,
    },
    participants
  );

  RNCallKeep.endCall(callId);
  teardownCall();
};

export const toggleMute = (mute: boolean) => {
  localStream?.getAudioTracks().forEach((track) => {
    track.enabled = !mute;
  });
};

export const toggleVideo = (enable: boolean) => {
  localStream?.getVideoTracks().forEach((track) => {
    track.enabled = enable;
  });
};

export const teardownCall = () => {
  peerConnection?.close();
  peerConnection = null;
  currentCallId = null;

  localStream?.getTracks().forEach((track) => track.stop());
  localStream = null;
  remoteStream = null;
};

export const getLocalStream = () => localStream;
export const listenToCallSession = (
  callId: string,
  callback: (session: FirebaseFirestoreTypes.DocumentData | undefined) => void
): (() => void) => {
  return firestore()
    .collection(CALL_SESSIONS_COLLECTION)
    .doc(callId)
    .onSnapshot((doc) => {
      callback(doc.data());
    });
};

export const getRemoteStream = () => remoteStream;
