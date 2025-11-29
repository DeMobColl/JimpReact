// Test Script - Paste di Browser Console (F12) saat di halaman Users React
// Untuk memverifikasi token dan test API call manual

console.log('🔍 ========================================');
console.log('🔍 REACT USER CRUD - DIAGNOSTIC TEST');
console.log('🔍 ========================================\n');

// 1. Check LocalStorage
console.log('📦 1. Checking LocalStorage...');
const token = localStorage.getItem('jimpitanToken');
const userStr = localStorage.getItem('jimpitanCurrentUser');
const user = userStr ? JSON.parse(userStr) : null;

console.log('   Token:', token ? `✅ ${token.substring(0, 20)}...` : '❌ NOT FOUND');
console.log('   User:', user ? `✅ ${user.name} (${user.role})` : '❌ NOT FOUND');
console.log('   Is Admin:', user?.role === 'admin' ? '✅ YES' : '❌ NO');

if (!token || !user || user.role !== 'admin') {
  console.log('\n❌ ERROR: Token atau user tidak valid, atau bukan admin');
  console.log('💡 Solution: Logout dan login ulang sebagai admin\n');
  console.log('🔍 ========================================\n');
} else {
  console.log('\n✅ LocalStorage OK\n');
  
  // 2. Check SCRIPT_URL
  console.log('🌐 2. Checking SCRIPT_URL...');
  const scriptUrl = import.meta.env.VITE_SCRIPT_URL;
  console.log('   SCRIPT_URL:', scriptUrl ? `✅ ${scriptUrl}` : '❌ NOT SET');
  
  if (!scriptUrl) {
    console.log('\n❌ ERROR: SCRIPT_URL tidak di-set');
    console.log('💡 Solution: Restart dev server (npm run dev)\n');
    console.log('🔍 ========================================\n');
  } else {
    console.log('\n✅ SCRIPT_URL OK\n');
    
    // 3. Manual Test Create User
    console.log('🧪 3. Manual Test - Create User...');
    console.log('   Akan mengirim test request ke Apps Script...\n');
    
    const testPayload = {
      action: "createUser",
      token: token,
      name: "Test Manual Console",
      username: "testconsole" + Date.now(),
      password: "test123",
      role: "petugas"
    };
    
    console.log('📤 Request Payload:');
    console.log(JSON.stringify(testPayload, null, 2));
    console.log('');
    
    fetch(scriptUrl, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testPayload),
    })
    .then(() => {
      console.log('✅ POST request sent successfully (no-cors mode)');
      console.log('⏳ Tunggu 2 detik, lalu cek Sheet Users...');
      console.log('\n💡 Jika user TIDAK muncul di sheet:');
      console.log('   1. Token mungkin expired - logout & login lagi');
      console.log('   2. Apps Script belum di-deploy ulang');
      console.log('   3. Ada error di backend - cek Apps Script logs\n');
      console.log('🔍 ========================================\n');
      
      // Wait 2 seconds then try to reload users
      setTimeout(() => {
        console.log('🔄 Reloading users from sheet...');
        fetch(`${scriptUrl}?action=getUsers&token=${token}&callback=testCallback`, {
          method: 'GET'
        })
        .then(response => response.text())
        .then(text => {
          console.log('📥 Response (raw JSONP):');
          console.log(text.substring(0, 200) + '...');
          console.log('\n✅ Test selesai! Cek Sheet Users untuk verifikasi.\n');
          console.log('🔍 ========================================\n');
        })
        .catch(err => {
          console.error('❌ Error reload users:', err);
        });
      }, 2000);
    })
    .catch(err => {
      console.error('❌ POST request failed:', err);
      console.log('\n💡 Possible issues:');
      console.log('   1. CORS policy blocking');
      console.log('   2. Network error');
      console.log('   3. SCRIPT_URL incorrect\n');
      console.log('🔍 ========================================\n');
    });
  }
}

// Export test function
window.testCreateUser = function(name, username, password, role = 'petugas') {
  const token = localStorage.getItem('jimpitanToken');
  const scriptUrl = import.meta.env.VITE_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbw5pqaREdIKGChIY7IUUbM2xRdZRiG0uYxzG_F9MJvXdOq7VpJH-9g5KRl6zu285OLTKg/exec';
  
  if (!token) {
    console.error('❌ No token found');
    return;
  }
  
  const payload = {
    action: "createUser",
    token: token,
    name: name,
    username: username,
    password: password,
    role: role
  };
  
  console.log('📤 Sending:', payload);
  
  fetch(scriptUrl, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  .then(() => {
    console.log('✅ Request sent! Check Sheet Users in 2 seconds...');
  })
  .catch(err => {
    console.error('❌ Error:', err);
  });
};

console.log('💡 Test function tersedia: testCreateUser(name, username, password, role)');
console.log('📝 Contoh: testCreateUser("John Doe", "johndoe", "pass123", "petugas")');
