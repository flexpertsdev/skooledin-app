# Storage Architecture Decision: Zustand Persist vs IndexedDB/Dexie vs Firebase

## Current Setup
- **Zustand + localStorage**: Chat messages, notebooks, context
- **Firebase**: Auth only
- **Limitations**: ~5-10MB localStorage limit, no complex queries

## Option Analysis

### 1. Zustand Persist (Current)
**Pros:**
- ✅ Simple, already implemented
- ✅ Great DX with React
- ✅ Synchronous reads
- ✅ Built-in React integration

**Cons:**
- ❌ 5-10MB localStorage limit
- ❌ No complex queries
- ❌ String-only storage (JSON serialization)
- ❌ Can't store files/blobs
- ❌ Single device only

**Best for:** Small apps, settings, UI state

### 2. IndexedDB with Dexie
**Pros:**
- ✅ Much larger storage (GBs)
- ✅ Complex queries and indexes
- ✅ Store files, blobs, typed arrays
- ✅ Offline-first
- ✅ Better performance for large datasets
- ✅ Can still use with Zustand

**Cons:**
- ❌ Async API (more complex)
- ❌ Still single device
- ❌ No real-time sync
- ❌ Manual backup needed

**Best for:** Large offline datasets, file storage, complex queries

### 3. Firebase Firestore
**Pros:**
- ✅ Multi-device sync
- ✅ Real-time updates
- ✅ Scalable (TBs)
- ✅ Built-in auth integration
- ✅ Offline support with cache
- ✅ Backups automatic

**Cons:**
- ❌ Costs money at scale
- ❌ Network latency
- ❌ More complex setup
- ❌ Vendor lock-in

**Best for:** Multi-device apps, collaboration, real-time needs

## Recommendation for SkooledIn

### Hybrid Approach (Best of All Worlds)

```typescript
// Architecture layers
1. Zustand (UI State) -> Fast, reactive UI
2. Dexie (Local Cache) -> Large storage, offline-first
3. Firebase (Sync Layer) -> Multi-device, backup

// Data flow
User Action -> Zustand (instant) -> Dexie (cache) -> Firebase (sync)
```

### Implementation Strategy

#### Phase 1: Add Dexie for Local Storage
```typescript
// src/lib/db.ts
import Dexie, { Table } from 'dexie';

export interface DBChatMessage extends ChatMessage {
  id: string;
  sessionId: string;
  userId: string;
  timestamp: number;
}

export interface DBNotebookEntry extends NotebookEntry {
  id: string;
  userId: string;
  searchText: string; // For full-text search
  embedding?: number[]; // For similarity search
}

class SkooledInDB extends Dexie {
  chatMessages!: Table<DBChatMessage>;
  notebooks!: Table<DBNotebookEntry>;
  learningProfiles!: Table<LearningProfile>;
  
  constructor() {
    super('SkooledInDB');
    this.version(1).stores({
      chatMessages: 'id, sessionId, userId, timestamp',
      notebooks: 'id, userId, subjectId, *tags, searchText',
      learningProfiles: 'userId, subjectId'
    });
  }
}

export const db = new SkooledInDB();
```

#### Phase 2: Update Stores to Use Dexie
```typescript
// src/stores/chat.store.ts
import { db } from '@/lib/db';

// In store actions
sendMessage: async (sessionId, content, attachments) => {
  const message = { /* ... */ };
  
  // 1. Update Zustand (instant UI)
  set(state => ({
    messages: { ...state.messages, [sessionId]: [...messages, message] }
  }));
  
  // 2. Save to Dexie (local persistence)
  await db.chatMessages.add(message);
  
  // 3. Optionally sync to Firebase
  if (user.subscription.plan !== 'free') {
    await firebaseChat.saveMessage(message);
  }
}
```

#### Phase 3: Smart Sync Strategy
```typescript
// Sync rules
interface SyncStrategy {
  // Free users: Local only (Dexie)
  free: {
    storage: 'local',
    limit: '100MB',
    sync: false
  },
  
  // Premium users: Local + Cloud
  premium: {
    storage: 'hybrid',
    limit: 'unlimited',
    sync: true,
    syncInterval: 5000 // 5 seconds
  }
}
```

### Why This Approach?

1. **Immediate Performance**: Zustand keeps UI snappy
2. **Large Storage**: Dexie handles GBs of notes/chats
3. **Offline First**: Works without internet
4. **Progressive Enhancement**: Free users get local, paid get sync
5. **Future Proof**: Can migrate to cloud when needed

### Specific Benefits for Education App

1. **Store PDFs/Images**: Dexie can handle file attachments
2. **Search Notes**: IndexedDB supports full-text search
3. **Track Progress**: Complex queries for learning analytics
4. **Work Offline**: Students can study without internet
5. **Sync When Ready**: Premium feature for multi-device

### Migration Path

```bash
Week 1: Add Dexie alongside Zustand
- Keep Zustand for UI state
- Add Dexie for persistence
- Migrate existing localStorage data

Week 2: Implement search/query features
- Full-text search in notebooks
- Learning analytics queries
- File attachment storage

Week 3: Add Firebase sync (optional)
- Premium feature
- Background sync
- Conflict resolution
```

## Decision: Dexie + Zustand

**Why:**
1. **Storage Needs**: Students will have lots of notes (GBs)
2. **Offline First**: Must work without internet
3. **Performance**: Local queries are instant
4. **Cost**: Free for most users
5. **Flexibility**: Can add cloud sync later

**Implementation Priority:**
1. Keep Zustand for state management
2. Add Dexie for data persistence
3. Firebase remains optional for sync