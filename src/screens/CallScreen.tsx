import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { RTCView } from 'react-native-webrtc';
import { useAppContext } from '../context/AppContext';
import {
  startCall,
  endCall,
  toggleMute,
  toggleVideo,
  getLocalStream,
  getRemoteStream,
  listenToCallSession,
} from '../services/callService';
import type { CallType, CallStatus, CallSession } from '../types';
import { formatCallDuration } from '../utils/timeUtils';

const { width, height } = Dimensions.get('window');

const CallScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { currentUser } = useAppContext();

  const {
    chatId,
    calleeIds,
    callType: initialCallType,
    call,
    answer,
    decline,
  } = route.params as {
    chatId?: string;
    calleeIds?: string[];
    callType?: CallType;
    call?: CallSession;
    answer?: () => Promise<void>;
    decline?: () => Promise<void>;
  };

  const [callId, setCallId] = useState<string | null>(call?.callId ?? null);
  const [callType, setCallType] = useState<CallType>(call?.callType ?? initialCallType ?? 'voice');
  const [callStatus, setCallStatus] = useState<CallStatus>(call?.status ?? 'ringing');
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(callType === 'video');
  const [callDuration, setCallDuration] = useState(0);
  const [isIncoming, setIsIncoming] = useState(!!call);

  const callStartTimeRef = useRef<number>(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!call && chatId && calleeIds && currentUser) {
      initiateCall();
    }
  }, []);

  useEffect(() => {
    if (callId) {
      const unsubscribe = listenToCallSession(callId, (session) => {
        if (!session) return;
        setCallStatus(session.status);
        if (session.status === 'active' && callStartTimeRef.current === 0) {
          callStartTimeRef.current = Date.now();
          startTimer();
        }
        if (
          session.status === 'ended' ||
          session.status === 'declined' ||
          session.status === 'failed' ||
          session.status === 'missed'
        ) {
          stopTimer();
          setTimeout(() => navigation.goBack(), 2000);
        }
      });
      return unsubscribe;
    }
  }, [callId, navigation]);

  const initiateCall = async () => {
    if (!chatId || !calleeIds || !currentUser) return;

    try {
      const newCallId = await startCall(currentUser.uid, calleeIds, chatId, callType);
      setCallId(newCallId);
      setCallStatus('ringing');
    } catch (error) {
      console.error('Error starting call:', error);
      navigation.goBack();
    }
  };

  const handleAccept = async () => {
    if (answer) {
      await answer();
      setCallStatus('active');
      callStartTimeRef.current = Date.now();
      startTimer();
    }
  };

  const handleDecline = async () => {
    if (decline) {
      await decline();
    }
    navigation.goBack();
  };

  const handleEndCall = async () => {
    stopTimer();
    if (callId && chatId && calleeIds) {
      await endCall(
        callId,
        chatId,
        'ended',
        [currentUser?.uid ?? '', ...(calleeIds ?? [])],
        callDuration,
        callType
      );
    }
    navigation.goBack();
  };

  const handleToggleMute = () => {
    const newMuteState = !isMuted;
    setIsMuted(newMuteState);
    toggleMute(newMuteState);
  };

  const handleToggleVideo = () => {
    const newCameraState = !isCameraOn;
    setIsCameraOn(newCameraState);
    toggleVideo(newCameraState);
  };

  const startTimer = () => {
    timerIntervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - callStartTimeRef.current) / 1000);
      setCallDuration(elapsed);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  const renderLocalVideo = () => {
    const localStream = getLocalStream();
    if (!localStream || callType !== 'video' || !isCameraOn) return null;

    return (
      <View style={styles.localVideoContainer}>
        <RTCView
          streamURL={localStream.toURL()}
          style={styles.localVideo}
          objectFit="cover"
          mirror={true}
        />
      </View>
    );
  };

  const renderRemoteVideo = () => {
    const remoteStream = getRemoteStream();
    if (!remoteStream || callType !== 'video') return null;

    return (
      <RTCView
        streamURL={remoteStream.toURL()}
        style={styles.remoteVideo}
        objectFit="cover"
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {callType === 'video' ? (
        <>
          {renderRemoteVideo()}
          {renderLocalVideo()}
        </>
      ) : (
        <View style={styles.voiceCallContainer}>
          <Image
            source={{
              uri:
                call?.calleeIds?.[0]
                  ? `https://ui-avatars.com/api/?background=1f6feb&color=fff&name=User`
                  : 'https://ui-avatars.com/api/?background=1f6feb&color=fff',
            }}
            style={styles.avatar}
          />
        </View>
      )}

      <View style={styles.overlay}>
        <View style={styles.topInfo}>
          <Text style={styles.callerName}>
            {call ? 'Incoming Call' : 'Calling...'}
          </Text>
          <Text style={styles.callStatus}>
            {callStatus === 'active'
              ? formatCallDuration(callDuration)
              : callStatus === 'ringing'
              ? 'Ringing...'
              : callStatus === 'connecting'
              ? 'Connecting...'
              : callStatus}
          </Text>
        </View>

        <View style={styles.controls}>
          <View style={styles.controlRow}>
            <TouchableOpacity style={styles.controlButton} onPress={handleToggleMute}>
              <Icon
                name={isMuted ? 'microphone-off' : 'microphone'}
                size={28}
                color={isMuted ? '#F85149' : '#E6EDF3'}
              />
            </TouchableOpacity>

            {callType === 'video' && (
              <TouchableOpacity style={styles.controlButton} onPress={handleToggleVideo}>
                <Icon
                  name={isCameraOn ? 'video' : 'video-off'}
                  size={28}
                  color={isCameraOn ? '#E6EDF3' : '#F85149'}
                />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.actionRow}>
            {isIncoming && callStatus === 'ringing' ? (
              <>
                <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
                  <Icon name="phone" size={32} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.declineButton} onPress={handleDecline}>
                  <Icon name="phone-hangup" size={32} color="#FFFFFF" />
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={styles.endCallButton} onPress={handleEndCall}>
                <Icon name="phone-hangup" size={32} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1117',
  },
  voiceCallContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 4,
    borderColor: '#25D366',
  },
  remoteVideo: {
    flex: 1,
    width,
    height,
  },
  localVideoContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 120,
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#25D366',
  },
  localVideo: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    paddingVertical: 50,
  },
  topInfo: {
    alignItems: 'center',
  },
  callerName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#E6EDF3',
    marginBottom: 8,
  },
  callStatus: {
    fontSize: 16,
    color: '#8B949E',
  },
  controls: {
    alignItems: 'center',
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  acceptButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#25D366',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  declineButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#F85149',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  endCallButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#F85149',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CallScreen;
