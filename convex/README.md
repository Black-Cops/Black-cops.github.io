# Convex Setup for Saki Browser

This directory contains the Convex backend configuration and functions.

## 🔗 Your Convex Deployment

**Production URL**: `https://neat-sparrow-459.convex.cloud`

This is already set up and ready to use!

## 📦 Installation

1. **Install dependencies**:
```bash
cd convex
npm install
```

2. **Install Convex CLI** (if not already installed):
```bash
npm install -g convex
```

## 🚀 Deployment

### Deploy to Existing Project

Since you already have a Convex project at `https://neat-sparrow-459.convex.cloud`, deploy updates with:

```bash
cd convex
convex deploy --prod --url https://neat-sparrow-459.convex.cloud
```

### First Time Setup (if needed)

If you need to connect to your existing project:

```bash
cd convex
convex dev --url https://neat-sparrow-459.convex.cloud
```

This will:
1. Link to your existing Convex project
2. Deploy schema and functions
3. Start watching for changes

## 📊 Schema

The database has two tables:

### Workspaces
```typescript
{
  title: string
  model: string
  _creationTime: number (auto-generated)
}
```

### Messages
```typescript
{
  workspaceId: Id<"workspaces">
  role: string ("user" | "assistant")
  content: string
  model?: string
  _creationTime: number (auto-generated)
}
```

## 🔧 Functions

### Workspace Functions

- `workspaces.list()` - Get all workspaces
- `workspaces.get(workspaceId)` - Get single workspace
- `workspaces.create(title, model)` - Create new workspace
- `workspaces.update(workspaceId, title)` - Update workspace title
- `workspaces.remove(workspaceId)` - Delete workspace and messages

### Message Functions

- `messages.list(workspaceId)` - Get all messages in workspace
- `messages.add(workspaceId, role, content, model?)` - Add new message
- `messages.remove(messageId)` - Delete message

## 🧪 Testing Functions

You can test functions in the Convex dashboard:

1. Go to https://dashboard.convex.dev/
2. Select project "neat-sparrow-459"
3. Click "Functions" tab
4. Select a function to test
5. Provide test arguments
6. Click "Run"

### Example Test Cases

**Create Workspace**:
```javascript
// Function: workspaces.create
{
  "title": "Test Workspace",
  "model": "anthropic/claude-3.5-sonnet"
}
```

**Add Message**:
```javascript
// Function: messages.add
{
  "workspaceId": "<workspace_id_from_previous_call>",
  "role": "user",
  "content": "Hello, world!",
  "model": "anthropic/claude-3.5-sonnet"
}
```

## 📱 Frontend Integration

The frontend is already configured to use your Convex deployment:

```javascript
// frontend/src/main.jsx
const convexUrl = 'https://neat-sparrow-459.convex.cloud'
const convex = new ConvexReactClient(convexUrl)
```

## 🔄 Development Workflow

### Local Development

1. **Start Convex dev server**:
```bash
cd convex
convex dev --url https://neat-sparrow-459.convex.cloud
```

2. **Make changes to functions** (schema.ts, workspaces.ts, messages.ts)

3. **Changes auto-deploy** to your dev deployment

### Production Deployment

1. **Deploy to production**:
```bash
cd convex
convex deploy --prod
```

2. **Verify deployment** in Convex dashboard

## 🔍 Monitoring

### Convex Dashboard

Visit https://dashboard.convex.dev/ to monitor:
- Function executions
- Database reads/writes
- Error logs
- Performance metrics

### Logs

View real-time logs:
```bash
cd convex
convex logs --prod
```

## 🛠️ Common Tasks

### View All Workspaces

```bash
cd convex
convex run workspaces:list
```

### View Messages in Workspace

```bash
cd convex
convex run messages:list '{"workspaceId": "workspace_id_here"}'
```

### Clear All Data (development only!)

```bash
# Delete all workspaces (will cascade delete messages)
cd convex
convex data delete workspaces --all
convex data delete messages --all
```

## 🐛 Troubleshooting

### "Cannot connect to Convex"

**Solution**:
```bash
# Verify URL is correct
echo $VITE_CONVEX_URL
# Should output: https://neat-sparrow-459.convex.cloud

# Redeploy functions
cd convex
convex deploy --prod
```

### "Function not found"

**Solution**:
```bash
# Deploy functions
cd convex
convex deploy --prod

# Verify in dashboard that functions are deployed
```

### Schema Changes Not Applying

**Solution**:
```bash
# Clear generated files and redeploy
cd convex
rm -rf _generated/
convex deploy --prod
```

## 📚 Resources

- [Convex Documentation](https://docs.convex.dev/)
- [Convex React Guide](https://docs.convex.dev/client/react)
- [Convex Dashboard](https://dashboard.convex.dev/)
- [Your Project](https://dashboard.convex.dev/t/neat-sparrow-459)

## ✅ Verification Checklist

- [ ] Convex URL is `https://neat-sparrow-459.convex.cloud`
- [ ] Functions deployed (`convex deploy --prod`)
- [ ] Schema includes workspaces and messages tables
- [ ] Frontend `.env` has correct `VITE_CONVEX_URL`
- [ ] Can create workspaces from UI
- [ ] Can send messages and see them persist
- [ ] Dashboard shows function executions

---

**Your Convex backend is ready! 🎉**
