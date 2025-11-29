import { useAuth } from '../hooks/useAuth';

export default function DebugAuth() {
  const { currentUser, token, isAdmin } = useAuth();
  
  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      background: '#1f2937',
      color: 'white',
      padding: '15px',
      borderRadius: '8px',
      fontSize: '12px',
      maxWidth: '300px',
      zIndex: 9999,
      fontFamily: 'monospace'
    }}>
      <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: 'bold' }}>
        🔍 Auth Debug
      </h3>
      <div style={{ marginBottom: '5px' }}>
        <strong>Token:</strong> {token ? `${token.substring(0, 20)}...` : '❌ MISSING'}
      </div>
      <div style={{ marginBottom: '5px' }}>
        <strong>User:</strong> {currentUser ? currentUser.name : '❌ NULL'}
      </div>
      <div style={{ marginBottom: '5px' }}>
        <strong>Username:</strong> {currentUser?.username || '❌ NULL'}
      </div>
      <div style={{ marginBottom: '5px' }}>
        <strong>Role:</strong> {currentUser?.role || '❌ NULL'}
      </div>
      <div style={{ marginBottom: '5px' }}>
        <strong>Is Admin:</strong> {isAdmin ? '✅ YES' : '❌ NO'}
      </div>
      <div style={{ marginTop: '10px', padding: '8px', background: '#374151', borderRadius: '4px' }}>
        <strong>Test Result:</strong><br />
        {token && currentUser && isAdmin ? (
          <span style={{ color: '#10b981' }}>✅ Ready to create user</span>
        ) : (
          <span style={{ color: '#ef4444' }}>
            ❌ {!token ? 'No token' : !currentUser ? 'No user' : !isAdmin ? 'Not admin' : 'Unknown error'}
          </span>
        )}
      </div>
    </div>
  );
}
