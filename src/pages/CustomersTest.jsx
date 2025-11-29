import PageLayout from '../components/PageLayout';

/**
 * Simple test version untuk debug Customers page
 * Jika ini muncul, berarti route dan import sudah benar
 */
export default function CustomersTest() {
  return (
    <PageLayout title="🧪 Test Customers" subtitle="Debug halaman customers">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
        <div className="text-center space-y-4">
          <div className="text-6xl">✅</div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Customers Route Working!
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Jika Anda melihat halaman ini, berarti:
          </p>
          <ul className="text-left max-w-md mx-auto space-y-2 text-gray-700 dark:text-gray-300">
            <li>✅ Route /customers sudah benar</li>
            <li>✅ Import PageLayout berhasil</li>
            <li>✅ Protected route admin working</li>
            <li>✅ Component Customers bisa di-render</li>
          </ul>
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              💡 Langkah selanjutnya: Cek console browser untuk error JavaScript
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
