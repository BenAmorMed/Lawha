'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PhotoFrameEditor from '@/components/photo-frame-editor/PhotoFrameEditor';

export default function PhotoFrameEditorPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-grow pt-10">
        <PhotoFrameEditor />
      </main>

      <Footer />
    </div>
  );
}
