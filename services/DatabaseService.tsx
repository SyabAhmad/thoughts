// services/DatabaseService.ts
import * as SQLite from 'expo-sqlite';

// Guard for environments where expo-sqlite isn't available (e.g. Expo Web)
const hasOpenDatabase = SQLite && typeof (SQLite as any).openDatabase === 'function';

let db: any = null;

if (hasOpenDatabase) {
  db = SQLite.openDatabase('chatapp.db');
} else {
  console.warn(
    'expo-sqlite openDatabase is not available in this environment. ' +
    'Using in-memory fallback. Run on a native device/emulator or provide a production fallback for web.'
  );

  // Minimal in-memory fallback that implements transaction(tx => tx.executeSql(...))
  // Supports the queries used in this file (CREATE TABLE, INSERT, SELECT by id, SELECT join, UPDATE, DELETE).
  const memory = {
    users: [] as any[],
    messages: [] as any[],
    lastUserId: 0,
    lastMessageId: 0,
  };

  const makeRows = (arr: any[]) => ({
    length: arr.length,
    item: (i: number) => arr[i],
  });

  db = {
    transaction: (fn: (tx: any) => void) => {
      const tx = {
        executeSql: (
          sql: string,
          params: any[] = [],
          success?: (tx: any, result: any) => void,
          error?: (tx: any, err: any) => boolean | void
        ) => {
          try {
            const s = sql.trim().toUpperCase();

            // CREATE TABLE -> noop success
            if (s.startsWith('CREATE TABLE')) {
              success && success(tx, { rows: makeRows([]) });
              return;
            }

            // INSERT INTO users
            if (s.startsWith('INSERT INTO USERS')) {
              const [name, about, subtitle, profile_image] = params;
              const id = ++memory.lastUserId;
              const now = new Date().toISOString();
              const row = {
                id,
                name,
                about,
                subtitle,
                profile_image,
                last_seen: null,
                created_at: now,
                updated_at: now,
              };
              memory.users.push(row);
              success && success(tx, { insertId: id, rows: makeRows([]) });
              return;
            }

            // INSERT INTO messages
            if (s.startsWith('INSERT INTO MESSAGES')) {
              const [text, timestamp, status, user_id] = params;
              const id = ++memory.lastMessageId;
              const now = new Date().toISOString();
              const row = {
                id,
                text,
                timestamp,
                status,
                user_id,
                created_at: now,
              };
              memory.messages.push(row);
              success && success(tx, { insertId: id, rows: makeRows([]) });
              return;
            }

            // SELECT * FROM users WHERE id = ?
            if (s.startsWith('SELECT * FROM USERS WHERE')) {
              const [id] = params;
              const rows = memory.users.filter((u) => u.id === id);
              success && success(tx, { rows: makeRows(rows) });
              return;
            }

            // SELECT m.*, u.name as user_name, u.profile_image ...
            if (s.startsWith('SELECT M.*, U.NAME AS USER_NAME') || s.includes('FROM MESSAGES M')) {
              // return messages left-joined with users
              const joined = memory.messages.map((m) => {
                const u = memory.users.find((x) => x.id === m.user_id) || {};
                return {
                  ...m,
                  user_name: u.name ?? null,
                  user_profile_image: u.profile_image ?? null,
                };
              }).sort((a, b) => {
                // try to order by created_at ascending
                if (a.created_at < b.created_at) return -1;
                if (a.created_at > b.created_at) return 1;
                return 0;
              });
              success && success(tx, { rows: makeRows(joined) });
              return;
            }

            // UPDATE users SET ... WHERE id = ?
            if (s.startsWith('UPDATE USERS SET')) {
              const id = params[params.length - 1];
              const user = memory.users.find((u) => u.id === id);
              if (user) {
                // naive update: map params to fields is hard; instead re-run a simple parse to find assignments
                // We'll attempt to extract assignments from SQL text for common fields used in code.
                if (sql.includes('name = ?')) user.name = params.shift();
                if (sql.includes('about = ?')) user.about = params.shift();
                if (sql.includes('subtitle = ?')) user.subtitle = params.shift();
                if (sql.includes('profile_image = ?')) user.profile_image = params.shift();
                if (sql.includes('last_seen = ?')) user.last_seen = params.shift();
                user.updated_at = new Date().toISOString();
              }
              success && success(tx, { rows: makeRows([]) });
              return;
            }

            // UPDATE messages SET status = ? WHERE id = ?
            if (s.startsWith('UPDATE MESSAGES SET')) {
              const [status, id] = params;
              const msg = memory.messages.find((m) => m.id === id);
              if (msg) msg.status = status;
              success && success(tx, { rows: makeRows([]) });
              return;
            }

            // DELETE FROM messages WHERE id = ?
            if (s.startsWith('DELETE FROM MESSAGES')) {
              const [id] = params;
              memory.messages = memory.messages.filter((m) => m.id !== id);
              success && success(tx, { rows: makeRows([]) });
              return;
            }

            // If we get here: unknown SQL - return empty success
            success && success(tx, { rows: makeRows([]) });
          } catch (err) {
            if (error) {
              // mimic expo-sqlite behavior: return false to rollback if error handler returns true-ish
              const ret = error(tx, err);
              if (ret === false) return;
            }
            console.error('MemoryDB executeSql error:', err);
          }
        },
      };

      // run synchronously (same pattern as WebSQL)
      try {
        fn(tx);
      } catch (err) {
        console.error('MemoryDB transaction error', err);
      }
    },
  };
}

// Initialize database tables
export const initDatabase = () => {
  if (!db) {
    console.warn('initDatabase skipped: no SQLite database available in this environment.');
    return;
  }
  
  // First check if tables already exist
  db.transaction((tx: any) => {
    tx.executeSql(
      "SELECT name FROM sqlite_master WHERE type='table' AND (name='users' OR name='messages');",
      [],
      (_: any, result: any) => {
        const existingTables = [];
        for (let i = 0; i < result.rows.length; i++) {
          existingTables.push(result.rows.item(i).name);
        }

        console.log('Existing tables:', existingTables.length ? existingTables.join(', ') : 'none');
        
        // Create missing tables
        createTablesIfNeeded(existingTables);
      },
      (_: any, error: any) => {
        console.log('Error checking existing tables:', error);
        // Fallback to trying to create all tables
        createTablesIfNeeded([]);
        return false;
      }
    );
  });
};

const createTablesIfNeeded = (existingTables: string[]) => {
  db.transaction((tx: any) => {
    // Create users table if needed
    if (!existingTables.includes('users')) {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          about TEXT,
          subtitle TEXT,
          profile_image TEXT,
          last_seen TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );`,
        [],
        () => console.log('Users table created successfully'),
        (_, error: any) => {
          console.log('Error creating users table:', error);
          return false;
        }
      );
    } else {
      console.log('Users table already exists - using existing data');
    }

    // Create messages table if needed
    if (!existingTables.includes('messages')) {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          text TEXT NOT NULL,
          timestamp TEXT NOT NULL,
          status TEXT DEFAULT 'sent',
          user_id INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        );`,
        [],
        () => console.log('Messages table created successfully'),
        (_, error: any) => {
          console.log('Error creating messages table:', error);
          return false;
        }
      );
    } else {
      console.log('Messages table already exists - using existing data');
    }
  });
};

// User operations
export const createUser = (
  name: string,
  about: string = '',
  subtitle: string = '',
  profileImage: string = ''
): Promise<number> => {
  if (!db) return Promise.reject(new Error('SQLite database not available in this environment.'));
  return new Promise((resolve, reject) => {
    db.transaction((tx: any) => {
      tx.executeSql(
        'INSERT INTO users (name, about, subtitle, profile_image) VALUES (?, ?, ?, ?);',
        [name, about, subtitle, profileImage],
        (_: any, result: any) => resolve(result.insertId),
        (_: any, error: any) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const getUser = (userId: number): Promise<any> => {
  if (!db) return Promise.reject(new Error('SQLite database not available in this environment.'));
  return new Promise((resolve, reject) => {
    db.transaction((tx: any) => {
      tx.executeSql(
        'SELECT * FROM users WHERE id = ?;',
        [userId],
        (_: any, result: any) => {
          if (result.rows.length > 0) {
            resolve(result.rows.item(0));
          } else {
            resolve(null);
          }
        },
        (_: any, error: any) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const updateUser = (
  userId: number,
  userData: {
    name?: string;
    about?: string;
    subtitle?: string;
    profileImage?: string;
    lastSeen?: string;
  }
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    // Build the SET clause dynamically based on what's provided
    const updateFields: string[] = [];
    const values: any[] = [];
    
    if (userData.name !== undefined) {
      updateFields.push('name = ?');
      values.push(userData.name);
    }
    
    if (userData.about !== undefined) {
      updateFields.push('about = ?');
      values.push(userData.about);
    }
    
    if (userData.subtitle !== undefined) {
      updateFields.push('subtitle = ?');
      values.push(userData.subtitle);
    }
    
    if (userData.profileImage !== undefined) {
      updateFields.push('profile_image = ?');
      values.push(userData.profileImage);
    }
    
    if (userData.lastSeen !== undefined) {
      updateFields.push('last_seen = ?');
      values.push(userData.lastSeen);
    }
    
    if (updateFields.length === 0) {
      resolve(false); // Nothing to update
      return;
    }
    
    // Add userId to values array for the WHERE clause
    values.push(userId);
    
    const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
    
    db.transaction(tx => {
      tx.executeSql(
        query,
        values,
        (_, result) => {
          resolve(result.rowsAffected > 0);
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

// Message operations
export const saveMessage = (
  text: string,
  timestamp: string,
  userId: number,
  status: string = MESSAGE_STATUS.SENT
): Promise<number> => {
  if (!db) return Promise.reject(new Error('SQLite database not available in this environment.'));
  return new Promise((resolve, reject) => {
    db.transaction((tx: any) => {
      // Insert message as 'sent' (one tick)
      tx.executeSql(
        'INSERT INTO messages (text, timestamp, status, user_id) VALUES (?, ?, ?, ?);',
        [text, timestamp, status, userId],
        (_: any, result: any) => {
          const insertedId = result.insertId;

          // Immediately update to 'saved' (double tick / blue) inside the same transaction.
          tx.executeSql(
            'UPDATE messages SET status = ? WHERE id = ?;',
            [MESSAGE_STATUS.SAVED, insertedId],
            () => {
              // Resolve after status updated so UI sees 'saved'
              resolve(insertedId);
            },
            (_: any, updateError: any) => {
              // If update fails, still resolve with inserted id (UI will keep single tick)
              console.warn('Failed to mark message as saved:', updateError);
              resolve(insertedId);
              return false;
            }
          );
        },
        (_: any, insertError: any) => {
          reject(insertError);
          return false;
        }
      );
    });
  });
};

// New: status constants and sendMessage helper for optimistic UI + DB confirmation.
// UI flow suggestion:
// - UI adds optimistic message with status 'sending' and a temporary negative id.
// - Call sendMessage(text, userId). When it resolves, replace optimistic item with returned message (status moves to 'saved').
// - If sendMessage fails to update to 'saved', it still returns the stored row id with status 'sent'.
export const MESSAGE_STATUS = {
  SENDING: 'sending',
  SENT: 'sent',      // one gray tick
  SAVED: 'saved',    // two ticks / blue
  DELIVERED: 'delivered',
  READ: 'read',
};

export const sendMessage = async (
  text: string,
  userId: number
): Promise<any> => {
  const timestamp = new Date().toISOString();

  // Insert as 'sent' (represents one tick)
  const id = await saveMessage(text, timestamp, userId, MESSAGE_STATUS.SENT);

  // Try to mark as 'saved' (represents double tick / blue)
  try {
    await updateMessageStatus(id, MESSAGE_STATUS.SAVED);
    return {
      id,
      text,
      timestamp,
      user_id: userId,
      status: MESSAGE_STATUS.SAVED,
      created_at: new Date().toISOString(),
    };
  } catch (err) {
    // If update fails, return the message with 'sent' status so UI shows one tick
    return {
      id,
      text,
      timestamp,
      user_id: userId,
      status: MESSAGE_STATUS.SENT,
      created_at: new Date().toISOString(),
    };
  }
};

export const getAllMessages = (): Promise<any[]> => {
  if (!db) return Promise.reject(new Error('SQLite database not available in this environment.'));
  return new Promise((resolve, reject) => {
    db.transaction((tx: any) => {
      tx.executeSql(
        `SELECT m.*, u.name as user_name, u.profile_image as user_profile_image 
         FROM messages m 
         LEFT JOIN users u ON m.user_id = u.id 
         ORDER BY m.created_at ASC;`,
        [],
        (_: any, result: any) => {
          const messages = [];
          for (let i = 0; i < result.rows.length; i++) {
            messages.push(result.rows.item(i));
          }
          resolve(messages);
        },
        (_: any, error: any) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const updateMessageStatus = (
  messageId: number,
  status: string
): Promise<void> => {
  if (!db) return Promise.reject(new Error('SQLite database not available in this environment.'));
  return new Promise((resolve, reject) => {
    db.transaction((tx: any) => {
      tx.executeSql(
        'UPDATE messages SET status = ? WHERE id = ?;',
        [status, messageId],
        () => resolve(),
        (_: any, error: any) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const deleteMessage = (id: number | string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    // Convert string ID to number if needed
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    
    console.log(`Attempting to delete message with ID: ${numericId}`);
    
    db.transaction(tx => {
      // First check if the message exists
      tx.executeSql(
        'SELECT * FROM messages WHERE id = ?',
        [numericId],
        (_, result) => {
          if (result.rows.length === 0) {
            console.log(`No message found with ID: ${numericId}`);
            resolve(false);
            return;
          }
          
          // If it exists, delete it
          tx.executeSql(
            'DELETE FROM messages WHERE id = ?',
            [numericId],
            (_, deleteResult) => {
              console.log(`Message deletion result: ${deleteResult.rowsAffected} rows affected`);
              resolve(deleteResult.rowsAffected > 0);
            },
            (_, error) => {
              console.error('Error deleting message:', error);
              reject(error);
              return false;
            }
          );
        },
        (_, error) => {
          console.error('Error checking message existence:', error);
          reject(error);
          return false;
        }
      );
    });
  });
};

// Add this debug function
export const getDatabaseInfo = () => {
  return {
    hasOpenDatabase,
    databaseType: hasOpenDatabase ? 'SQLite' : 'In-Memory',
    isWeb: typeof window !== 'undefined',
    platform: require('expo-constants').default?.platform?.ios ? 'ios' : 
              require('expo-constants').default?.platform?.android ? 'android' : 'unknown'
  };
};

// Export the database instance
export { db };

