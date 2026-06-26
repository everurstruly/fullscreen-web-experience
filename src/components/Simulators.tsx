import React, { useState } from 'react';
import { Camera, Image as ImageIcon, Heart, ShoppingBag, Plus, Sparkles, ExternalLink } from 'lucide-react';

interface SimulatorProps {
  currentTab: string;
  onOpenContextMenu: (e: React.MouseEvent, imgUrl: string) => void;
  includeSmall: boolean;
  onLoadMore?: () => void;
  infiniteImages: string[];
}

export default function Simulators({
  currentTab,
  onOpenContextMenu,
  includeSmall,
  onLoadMore,
  infiniteImages
}: SimulatorProps) {

  const handleImageRightClick = (e: React.MouseEvent, url: string) => {
    e.preventDefault();
    onOpenContextMenu(e, url);
  };

  switch (currentTab) {
    case 'article':
      return (
        <article className="max-w-2xl mx-auto py-8 px-4 bg-white text-gray-900 rounded-lg shadow-sm font-serif">
          {/* Page-level metadata for fallback */}
          <h1 className="text-4xl font-bold tracking-tight mb-4 leading-tight font-sans text-gray-900">
            The Quiet Renaissance of Film Photography in the Digital Era
          </h1>
          <div className="flex items-center gap-3 mb-8 font-sans text-xs text-gray-500 border-b border-gray-100 pb-4">
            <span className="font-semibold text-gray-800">By Jonathan Mercer</span>
            <span>•</span>
            <span>June 25, 2026</span>
            <span>•</span>
            <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-mono">Editorial Focus</span>
          </div>

          <p className="text-lg leading-relaxed mb-6 text-gray-700">
            In an age dominated by instant previews and gigapixel sensor density, an unexpected counter-culture is thriving. Younger generations are intentionally slowing down, adopting analog tools that limit their exposures and reward delayed gratification.
          </p>

          <figure className="my-8 group relative">
            <img
              src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80"
              data-original="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=2400&q=90"
              alt="Classic SLR mechanical analog camera on a rustic desk"
              title="Classic SLR mechanical analog camera"
              className="w-full h-96 object-cover rounded-md cursor-help border border-gray-100 transition shadow-sm hover:shadow-md"
              onContextMenu={(e) => handleImageRightClick(e, 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=2400&q=90')}
            />
            <figcaption className="mt-3 text-xs text-center text-gray-500 italic">
              Fig. 1: A vintage mechanical SLR camera representing the tangible feedback of analog dials. (CORS support enabled)
            </figcaption>
          </figure>

          <p className="text-lg leading-relaxed mb-6 text-gray-700">
            Analog enthusiasts describe the physical experience of winding the lever, hearing the metallic shutter snap, and carefully storing exposed canisters. The camera is no longer a transparent proxy for content; it is a physical canvas in itself.
          </p>

          <figure className="my-8 group relative">
            <img
              src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80"
              data-original="https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=2400&q=90"
              alt="Developing physical photographs under dim red safelight"
              title="Analog darkroom print developing"
              className="w-full h-80 object-cover rounded-md cursor-help border border-gray-100 transition shadow-sm hover:shadow-md"
              onContextMenu={(e) => handleImageRightClick(e, 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=2400&q=90')}
            />
            <figcaption className="mt-3 text-xs text-center text-gray-500 italic">
              Fig. 2: The chemical magic of silver-halide developer pans under safe lighting.
            </figcaption>
          </figure>

          {includeSmall && (
            <div className="mt-12 p-4 bg-gray-50 rounded border border-gray-100 flex items-center justify-between font-sans">
              <span className="text-xs text-gray-500">Tiny editorial badge (Include small icons is ON):</span>
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=32&h=32&q=80"
                alt="Tiny bio icon avatar badge"
                className="w-8 h-8 rounded-full border border-gray-200"
                onContextMenu={(e) => handleImageRightClick(e, 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=32&h=32&q=80')}
              />
            </div>
          )}
        </article>
      );

    case 'store':
      return (
        <div id="productTitle" className="max-w-4xl mx-auto p-6 bg-white text-gray-900 rounded-lg shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 font-sans">
          {/* Main Showcase photo */}
          <div className="flex flex-col gap-4">
            <div className="border border-gray-100 rounded-lg overflow-hidden relative group shadow-sm bg-gray-50 flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80"
                data-original="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=2400&q=90"
                alt="Radiant Scarlet Sports Trainer Shoe"
                title="Premium Athletic Trainer Sneaker"
                className="w-full h-96 object-contain p-6 cursor-help"
                onContextMenu={(e) => handleImageRightClick(e, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=2400&q=90')}
              />
              <span className="absolute top-4 left-4 bg-red-500 text-white font-mono text-xs px-2.5 py-1 rounded font-bold tracking-wider uppercase">
                Best Seller
              </span>
            </div>
            
            <div className="grid grid-cols-4 gap-3">
              {[
                'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80',
                'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=400&q=80',
                'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=400&q=80',
                'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=400&q=80'
              ].map((src, idx) => (
                <div key={idx} className="border border-gray-100 hover:border-coral-500 rounded-md overflow-hidden bg-gray-50 flex items-center justify-center p-2 cursor-pointer transition">
                  <img 
                    src={src} 
                    alt={`Thumbnail view ${idx + 1}`}
                    className="w-full h-12 object-contain"
                    onContextMenu={(e) => handleImageRightClick(e, src)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product details for adapter matching */}
          <div className="flex flex-col justify-between">
            <div>
              <span className="text-xs text-red-500 font-bold uppercase tracking-widest block mb-2">Trainer Elite</span>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight leading-tight mb-3">
                Apex Sprint Scarlet Carbon Trainer
              </h1>

              {/* Mock ratings for Amazon adaptation */}
              <div className="flex items-center gap-2 mb-4">
                <span className="a-icon-alt text-amber-500 text-sm font-semibold">★ 4.8 out of 5 stars</span>
                <span className="text-xs text-gray-400">• (1,248 Verified Reviews)</span>
              </div>

              {/* Price segment */}
              <div className="a-price border-y border-gray-100 py-4 mb-4 flex items-baseline gap-2">
                <span className="text-xs text-gray-400 self-start mt-1 font-semibold">$</span>
                <span className="a-offscreen text-4xl font-extrabold text-gray-900">189</span>
                <span className="text-lg font-bold text-gray-800">.99</span>
                <span className="text-xs text-gray-400 line-through ml-2 font-mono">$249.99</span>
              </div>

              <p className="text-sm text-gray-600 leading-relaxed mb-6">
                Engineered for maximum velocity and explosive energy return. Features a featherlight woven mesh upper and a carbon-fiber spring plate suspended in reactive nitrogen-infused cushioning.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6 text-xs bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div>
                  <span className="text-gray-400 block font-medium">Outsole</span>
                  <span className="text-gray-800 font-semibold">Traction Grip Compound</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Offset</span>
                  <span className="text-gray-800 font-semibold">4mm (Spring Ready)</span>
                </div>
              </div>
            </div>

            <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3.5 rounded-lg shadow transition flex items-center justify-center gap-2">
              <ShoppingBag size={18} />
              Add to Shopping Cart
            </button>
          </div>
        </div>
      );

    case 'portfolio':
      return (
        <div className="max-w-5xl mx-auto p-4 bg-gray-950 text-white rounded-lg shadow-inner font-sans">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 border-b border-gray-800 pb-4">
            <div>
              <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
                <Camera size={22} className="text-orange-500 animate-pulse" />
                VISTAS PHOTOGRAPHY STREAM
              </h1>
              <p className="text-xs text-gray-400">Curated landscape portfolios. Click to zoom, hold M for magnifier.</p>
            </div>
            <div className="bg-orange-500/10 border border-orange-500/20 text-orange-400 px-3 py-1 rounded text-xs font-semibold">
              Site Host: unsplash.com
            </div>
          </div>

          {/* Grid layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                src: 'https://images.unsplash.com/photo-1472214222541-d510753a49fa?auto=format&fit=crop&w=600&q=80',
                high: 'https://images.unsplash.com/photo-1472214222541-d510753a49fa?auto=format&fit=crop&w=2400&q=90',
                title: 'Verdant rolling hills in Tuscany sunset',
                author: 'Matteo Rossini',
                likes: 428
              },
              {
                src: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
                high: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2400&q=90',
                title: 'Dramatic azure beach break wave splash',
                author: 'Alana Sands',
                likes: 1104
              },
              {
                src: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=600&q=80',
                high: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=2400&q=90',
                title: 'Mist-draped suspension bridge over pine forest',
                author: 'Marcus Vance',
                likes: 832
              }
            ].map((pic, idx) => (
              <div key={idx} className="group bg-gray-900 border border-gray-800 rounded-xl overflow-hidden relative shadow-md hover:shadow-xl transition flex flex-col justify-between">
                <div className="relative overflow-hidden aspect-video bg-black flex items-center justify-center">
                  <img
                    src={pic.src}
                    data-original={pic.high}
                    alt={pic.title}
                    title={pic.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500 cursor-zoom-in"
                    onContextMenu={(e) => handleImageRightClick(e, pic.high)}
                  />
                  
                  {/* Floating credits bar */}
                  <a href="/@profile" className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm py-1 px-2.5 rounded-full text-[10px] text-white hover:bg-orange-500 transition">
                    <span className="font-semibold">{pic.author}</span>
                  </a>
                </div>

                <div className="p-4">
                  <p className="text-xs text-gray-300 line-clamp-2 font-medium mb-3">{pic.title}</p>
                  <div className="flex items-center justify-between text-[11px] text-gray-500">
                    <span className="font-mono">Adapter Target</span>
                    <span className="flex items-center gap-1 text-red-500">
                      <Heart size={10} fill="currentColor" /> {pic.likes}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'infinite':
      return (
        <div className="max-w-xl mx-auto p-4 bg-gray-50 text-gray-900 rounded-lg shadow border border-gray-100 font-sans">
          <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-3">
            <div>
              <h1 className="text-lg font-black tracking-tight text-indigo-900 flex items-center gap-1.5">
                <Sparkles size={16} className="text-indigo-500 animate-spin" style={{ animationDuration: '4s' }} />
                SPA DYNAMIC GRAPH STREAM
              </h1>
              <p className="text-[11px] text-gray-400">Dynamic listings. Appends live elements to prove MutationObserver.</p>
            </div>
            <button 
              onClick={onLoadMore}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-1.5 px-3 rounded flex items-center gap-1.5 transition"
            >
              <Plus size={14} />
              Append New Image
            </button>
          </div>

          <div className="flex flex-col gap-6">
            {infiniteImages.map((src, idx) => (
              <div key={idx} className="bg-white rounded-lg border border-gray-100 overflow-hidden shadow-sm p-3 relative">
                <span className="absolute top-4 right-4 bg-indigo-50 text-indigo-600 text-[10px] px-2 py-0.5 rounded font-bold font-mono">
                  Dynamic #{idx + 1}
                </span>

                <img 
                  src={src}
                  data-original={src.replace('&w=600', '&w=2000')}
                  alt={`Dynamically injected infinite picture item ${idx + 1}`}
                  className="w-full h-64 object-cover rounded-md cursor-pointer mb-2 hover:brightness-95 transition"
                  onContextMenu={(e) => handleImageRightClick(e, src.replace('&w=600', '&w=2000'))}
                />
                
                <div className="flex items-center justify-between text-[11px] text-gray-400 mt-2">
                  <span>Injected: {new Date().toLocaleTimeString()}</span>
                  <span className="text-indigo-600 font-semibold cursor-pointer flex items-center gap-0.5">
                    Trigger Loupe <ExternalLink size={10} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    default:
      return null;
  }
}
