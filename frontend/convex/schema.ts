import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  workspaces: defineTable({
    title: v.string(),
    model: v.string(),
  }).index("by_creation_time", ["_creationTime"]),

  messages: defineTable({
    workspaceId: v.id("workspaces"),
    role: v.string(),
    content: v.string(),
    model: v.optional(v.string()),
  })
    .index("by_workspace", ["workspaceId", "_creationTime"])
    .index("by_creation_time", ["_creationTime"]),
});
