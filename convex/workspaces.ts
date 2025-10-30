import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  handler: async (ctx) => {
    const workspaces = await ctx.db
      .query("workspaces")
      .order("desc")
      .take(100);
    return workspaces;
  },
});

export const get = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.workspaceId);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    model: v.string(),
  },
  handler: async (ctx, args) => {
    const workspaceId = await ctx.db.insert("workspaces", {
      title: args.title,
      model: args.model,
    });
    return workspaceId;
  },
});

export const update = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.workspaceId, {
      title: args.title,
    });
  },
});

export const remove = mutation({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.workspaceId);
    
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();
    
    for (const message of messages) {
      await ctx.db.delete(message._id);
    }
  },
});
