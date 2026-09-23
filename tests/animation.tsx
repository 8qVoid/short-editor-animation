import React from 'react';
import { createRoot } from 'react-dom/client';
import App from '../src/App';
import { useEditorStore } from '../src/store/editorStore';
import { assets } from '../src/data/assets';
(window as any).editorStore = useEditorStore;
(window as any).editorAssets = assets;
createRoot(document.getElementById('root')!).render(<App/>);
