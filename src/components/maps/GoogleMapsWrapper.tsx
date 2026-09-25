import React, { ReactNode } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';

interface GoogleMapsWrapperProps {
  children: ReactNode;
}

// Access provisioned API Key from environment or fallback to provisioned demo key
export const GOOGLE_MAPS_API_KEY =
  (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) ||
  'AIzaSyA6z6LCipBD5sFXBFoZzaoJPdU4R4KjJQ0';

export const GoogleMapsWrapper: React.FC<GoogleMapsWrapperProps> = ({ children }) => {
  return (
    <APIProvider
      apiKey={GOOGLE_MAPS_API_KEY}
      solutionChannel="GMP_mcp_codeassist_v1_aistudio"
      libraries={['places', 'marker', 'geometry']}
    >
      {children}
    </APIProvider>
  );
};
