# 🚀 Immediate Action Plan: AI Chat & Notebook Integration

## Priority 1: Core Type System & Infrastructure (Today)

### 1. Create AI Types
```bash
src/types/ai.types.ts
```
- ChatMessage with attachments support
- StudyContext for awareness
- NotebookEntry with all fields
- MessageAttachment types
- AIThinking structure

### 2. Update Existing Types
```bash
src/types/index.ts
```
- Export all AI types
- Ensure compatibility with existing types

### 3. Create Stores
```bash
src/stores/chat.store.ts
src/stores/notebook.store.ts
```
- Implement with Zustand
- Add persistence
- Include all actions from reference files

## Priority 2: Basic Chat UI with Context (Tomorrow)

### 1. Update Chat Page
- Add attachment bar UI
- Implement attachment picker sheet
- Show attached context in messages
- Add "Save to Notebook" button on AI responses

### 2. Create Components
```bash
src/components/chat/AttachmentChip.tsx
src/components/chat/AttachmentPicker.tsx
src/components/chat/ChatMessage.tsx (update existing)
```

### 3. Mock AI Service
```bash
src/services/ai.service.ts
```
- Create class structure
- Implement mock responses
- Add context processing

## Priority 3: Notebook Integration (Day 3-4)

### 1. Create Notebook Page
```bash
src/pages/notebook/NotebookPage.tsx
```
- Grid layout for notes
- Filter by type/subject
- Search functionality
- Favorite/archive actions

### 2. Save from Chat Flow
- Implement save dialog
- Create notebook entry from chat
- Update chat message to show saved status

### 3. Notebook Components
```bash
src/components/notebook/NotebookCard.tsx
src/components/notebook/NotebookEditor.tsx
src/components/notebook/SaveFromChatDialog.tsx
```

## Priority 4: Attachment System (Day 5-6)

### 1. File Upload
```bash
src/components/common/FileUploadZone.tsx
src/services/upload.service.ts
```
- Handle images, PDFs, documents
- Show upload progress
- Generate previews

### 2. Attachment Management
- Store attachments in chat messages
- Display inline previews
- Link to full viewers

### 3. Basic PDF Viewer
```bash
src/components/viewers/PDFViewer.tsx
```
- Use react-pdf
- Basic page navigation
- Text selection

## Quick Wins to Implement First

### 1. Add to Current Chat Page
```typescript
// In ChatPage.tsx, add:
const [attachments, setAttachments] = useState<MessageAttachment[]>([]);

// Add attachment bar above input
{attachments.length > 0 && (
  <div className="px-4 py-2 bg-purple-50 border-t">
    <div className="flex gap-2 overflow-x-auto">
      {attachments.map(att => (
        <AttachmentChip key={att.id} attachment={att} />
      ))}
    </div>
  </div>
)}

// Update + button to show attachment picker
<button onClick={() => setShowAttachmentPicker(true)}>
  <Plus />
</button>
```

### 2. Create Simple Attachment Picker
```typescript
// Bottom sheet with tabs for:
// - Recent notebook entries
// - Current assignments  
// - Upload new file
```

### 3. Add Save Button to AI Messages
```typescript
// In chat message, if message.type === 'ai':
<button onClick={() => saveToNotebook(message)}>
  <BookOpen className="w-4 h-4" />
  Save to Notebook
</button>
```

## Testing Approach

### Manual Testing Flow
1. Start chat conversation
2. Attach a mock notebook entry
3. Ask AI about the attachment
4. Save AI response to notebook
5. View in notebook page
6. Search for the saved note

### Key Features to Validate
- [ ] Attachments persist in chat
- [ ] AI acknowledges attached context
- [ ] Save to notebook works smoothly
- [ ] Notebook entries are searchable
- [ ] Context flows between features

## Migration Path from Mock to Real

### 1. AI Service
- Start with mock responses
- Add Gemini API integration
- Keep mock as fallback

### 2. File Storage
- Start with base64 in localStorage
- Move to Firebase Storage
- Add CDN for performance

### 3. Search
- Start with simple string matching
- Add Fuse.js for fuzzy search
- Consider Algolia for scale

## Immediate Next Steps

1. **Right Now**: Create `ai.types.ts` with all interfaces
2. **Next**: Update chat page with attachment UI
3. **Then**: Create notebook store and basic page
4. **Finally**: Wire up save-to-notebook flow

## Code to Copy First

From reference files:
1. Copy type definitions from `skooledin-ai-service.ts`
2. Copy store structure from `skooledin-chat-store.ts`
3. Copy UI patterns from `skooledin-ai-chat-page.txt`
4. Copy notebook store from `skooledin-notebook-store.ts`

## Success Checkpoint

By end of week, user should be able to:
1. ✅ Attach context to chat
2. ✅ See AI acknowledge the context
3. ✅ Save useful AI responses to notebook
4. ✅ Find saved notes by searching
5. ✅ Organize notes by subject/type