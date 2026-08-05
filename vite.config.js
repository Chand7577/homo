import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Enable code splitting
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor libraries
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('lucide-react')) {
              return 'ui-vendor';
            }
            if (id.includes('jspdf')) {
              return 'pdf-vendor';
            }
            if (id.includes('socket.io-client')) {
              return 'socket-vendor';
            }
            return 'vendor';
          }
          
          // Split large components
          if (id.includes('UserManagement') || 
              id.includes('MedicineManagement') || 
              id.includes('RubricManagement') ||
              id.includes('RepertoriesTab')) {
            return 'admin-components';
          }
          
          // More granular component splitting
          if (id.includes('RubricAnalyzer')) {
            return 'rubric-analyzer';
          }
          if (id.includes('RepertoryChart')) {
            return 'repertory-chart';
          }
          if (id.includes('AnalysisHistoryTab')) {
            return 'analysis-history';
          }
          
          if (id.includes('PatientDashboardTab') || 
              id.includes('PatientsDatabase') || 
              id.includes('PatientConsultationForm')) {
            return 'patient-components';
          }
        }
      }
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 500,
    // Use default minification (esbuild - faster and doesn't require terser)
    minify: true,
  },
  // Optimize images - don't inline large images
  assetsInlineLimit: 4096, // Only inline assets smaller than 4kb
})
