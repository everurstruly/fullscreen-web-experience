import React, { useState } from 'react';
import { Camera, Image as ImageIcon, Heart, ShoppingBag, Plus, Sparkles, ExternalLink, ChevronLeft, ChevronRight, Play, Film } from 'lucide-react';

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

  const [carouselIdx, setCarouselIdx] = useState(0);

  const carouselItems = [
    {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      title: 'Ocean Horizon',
      caption: 'A breathtaking high-resolution vista of azure rolling beach breaks under a morning sun.'
    },
    {
      type: 'video',
      url: 'https://vjs.zencdn.net/v/oceans.mp4',
      poster: 'https://vjs.zencdn.net/v/oceans.png',
      title: 'Deep Ocean Life',
      caption: 'Sights of crashing ocean waves filmed in pristine high definition. (100% Playable Test Video)'
    },
    {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1472214222541-d510753a49fa?auto=format&fit=crop&w=1200&q=80',
      title: 'Tuscan Sunset',
      caption: 'Lush green rolling hills of Tuscany cast in a warm, golden dusk glow.'
    },
    {
      type: 'video',
      url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
      poster: 'https://images.unsplash.com/photo-1500627869374-13cd993b1115?auto=format&fit=crop&w=600&q=80',
      title: 'Blooming Flower Time-lapse',
      caption: 'MDN standard time-lapse documentation of a flower blooming under direct sun. (100% Playable Test Video)'
    },
    {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=1200&q=80',
      title: 'Suspension Bridge',
      caption: 'Mist-draped suspension bridge hanging high over a dense, serene pine forest canopy.'
    },
    {
      type: 'video',
      url: 'https://www.w3schools.com/html/mov_bbb.mp4',
      poster: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
      title: 'Big Buck Bunny Clip',
      caption: 'W3Schools official standard Big Buck Bunny video segment for testing video codecs. (100% Playable Test Video)'
    }
  ];

  const handleImageRightClick = (e: React.MouseEvent, url: string) => {
    e.preventDefault();
    onOpenContextMenu(e, url);
  };

  switch (currentTab) {
    case 'carousel':
      return (
        <div className="max-w-4xl mx-auto p-6 bg-zinc-950 text-white rounded-2xl border border-zinc-800 shadow-2xl font-sans relative">
          <div className="flex items-center justify-between mb-6 border-b border-zinc-800 pb-4">
            <div>
              <h1 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
                <Film size={20} className="text-orange-500 animate-pulse" />
                MIXED-MEDIA INTERACTIVE CAROUSEL
              </h1>
              <p className="text-xs text-zinc-400">
                A state-of-the-art content carousel mixing high-res images and playable HTML5 videos.
              </p>
            </div>
            <div className="bg-orange-500/10 border border-orange-500/20 text-orange-400 px-3 py-1 rounded text-xs font-semibold font-mono">
              Test Area: Mixed Assets
            </div>
          </div>

          {/* Active viewport of the carousel */}
          <div className="relative group/viewport overflow-hidden bg-zinc-900 border border-zinc-800/80 rounded-2xl aspect-video md:h-[420px] flex items-center justify-center shadow-lg">
            {carouselItems[carouselIdx].type === 'image' ? (
              <img
                src={carouselItems[carouselIdx].url}
                alt={carouselItems[carouselIdx].title}
                title={carouselItems[carouselIdx].title}
                className="w-full h-full object-cover transition-all duration-300 group-hover/viewport:scale-[1.02]"
                onContextMenu={(e) => handleImageRightClick(e, carouselItems[carouselIdx].url)}
              />
            ) : (
              <div className="w-full h-full relative bg-black flex items-center justify-center">
                <video
                  key={carouselItems[carouselIdx].url} // Force remount on slide change so source updates instantly
                  src={carouselItems[carouselIdx].url}
                  poster={carouselItems[carouselIdx].poster}
                  controls
                  playsInline
                  autoPlay={false}
                  className="max-w-full max-h-full object-contain"
                  onContextMenu={(e) => handleImageRightClick(e, carouselItems[carouselIdx].url)}
                />
              </div>
            )}

            {/* Left and Right arrows */}
            <button
              onClick={() => setCarouselIdx((prev) => (prev - 1 + carouselItems.length) % carouselItems.length)}
              className="absolute left-4 w-10 h-10 bg-black/60 hover:bg-orange-500 text-white rounded-full flex items-center justify-center transition backdrop-blur-sm shadow border border-zinc-700/50 hover:border-orange-400 active:scale-95"
              title="Previous Slide"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => setCarouselIdx((prev) => (prev + 1) % carouselItems.length)}
              className="absolute right-4 w-10 h-10 bg-black/60 hover:bg-orange-500 text-white rounded-full flex items-center justify-center transition backdrop-blur-sm shadow border border-zinc-700/50 hover:border-orange-400 active:scale-95"
              title="Next Slide"
            >
              <ChevronRight size={20} />
            </button>

            {/* Float HUD banner on hover to assist with Loupe testing */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between opacity-0 group-hover/viewport:opacity-100 transition-opacity duration-300 pointer-events-none">
              <span className="bg-zinc-950/80 backdrop-blur-md border border-zinc-800 text-[10px] text-zinc-300 px-2.5 py-1 rounded-full font-medium shadow-md">
                Format: <span className="text-orange-400 font-bold uppercase font-mono">{carouselItems[carouselIdx].type}</span>
              </span>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenContextMenu(e as any, carouselItems[carouselIdx].url);
                }}
                className="pointer-events-auto bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 transition shadow-lg active:scale-95"
              >
                <Sparkles size={11} />
                Open Slide in Loupe
              </button>
            </div>

            {/* Custom bottom subtitle bar inside viewport */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/85 to-transparent p-4 flex flex-col gap-1 select-none pointer-events-none">
              <span className="text-orange-400 text-xs font-bold font-mono tracking-widest uppercase">
                Slide {carouselIdx + 1} of {carouselItems.length}
              </span>
              <h2 className="text-lg font-bold text-white tracking-tight leading-tight">
                {carouselItems[carouselIdx].title}
              </h2>
              <p className="text-xs text-zinc-300 max-w-xl line-clamp-2">
                {carouselItems[carouselIdx].caption}
              </p>
            </div>
          </div>

          {/* Dots Pagination */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {carouselItems.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCarouselIdx(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  carouselIdx === idx ? 'w-8 bg-orange-500' : 'w-2 bg-zinc-800 hover:bg-zinc-700'
                }`}
                title={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Thumbnail preview strip */}
          <div className="mt-6 border-t border-zinc-800/80 pt-5">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <ImageIcon size={12} className="text-orange-400" />
              Interactive Slides Strip
            </h3>
            <div className="grid grid-cols-6 gap-3">
              {carouselItems.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => setCarouselIdx(idx)}
                  className={`relative aspect-video rounded-lg overflow-hidden border cursor-pointer transition-all duration-200 bg-black flex items-center justify-center ${
                    carouselIdx === idx 
                      ? 'border-orange-500 ring-2 ring-orange-500/20 scale-95 shadow-md shadow-orange-500/10' 
                      : 'border-zinc-800 hover:border-zinc-700 hover:scale-105'
                  }`}
                >
                  {item.type === 'image' ? (
                    <img src={item.url} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="w-full h-full relative flex items-center justify-center">
                      <img src={item.poster} className="w-full h-full object-cover opacity-80" alt="" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition">
                        <Play size={14} className="text-white fill-white shadow-md drop-shadow" />
                      </div>
                    </div>
                  )}
                  <span className="absolute bottom-1 right-1 bg-black/80 border border-zinc-800 text-[8px] font-bold font-mono px-1 rounded text-zinc-400 uppercase">
                    {item.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

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

          <figure className="my-8 group relative">
            <video
              src="https://vjs.zencdn.net/v/oceans.mp4"
              poster="https://vjs.zencdn.net/v/oceans.png"
              controls
              className="w-full h-96 object-cover rounded-md cursor-help border border-gray-100 transition shadow-sm hover:shadow-md animate-fade-in"
              onContextMenu={(e) => handleImageRightClick(e, 'https://vjs.zencdn.net/v/oceans.mp4')}
            />
            <figcaption className="mt-3 text-xs text-center text-gray-500 italic">
              Fig. 3: "Oceans" standard high-definition playable testing video illustrating responsive HTML5 video discovery in Loupe.
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

            {/* Product video section */}
            <div className="mt-5 border-t border-gray-100 pt-4">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                <Play size={12} className="text-orange-500 animate-pulse" />
                Apex Sprint Video Demonstration
              </span>
              <video
                src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
                poster="https://images.unsplash.com/photo-1500627869374-13cd993b1115?auto=format&fit=crop&w=600&q=80"
                controls
                playsInline
                className="w-full h-32 object-cover rounded-lg border border-gray-200"
                onContextMenu={(e) => handleImageRightClick(e, 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4')}
              />
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

            {/* Video card inside portfolio grid */}
            <div className="group bg-gray-900 border border-gray-800 rounded-xl overflow-hidden relative shadow-md hover:shadow-xl transition flex flex-col justify-between animate-fade-in">
              <div className="relative overflow-hidden aspect-video bg-black flex items-center justify-center">
                <video
                  src="https://www.w3schools.com/html/mov_bbb.mp4"
                  poster="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg"
                  controls
                  className="w-full h-full object-cover transition duration-500"
                  onContextMenu={(e) => handleImageRightClick(e, 'https://www.w3schools.com/html/mov_bbb.mp4')}
                />
              </div>
              <div className="p-4">
                <p className="text-xs text-gray-300 line-clamp-2 font-medium mb-3">Sights & Sounds: W3Schools Playable Test Loop (100% CORS-Ready)</p>
                <div className="flex items-center justify-between text-[11px] text-gray-500">
                  <span className="font-mono">Video Cinematic</span>
                  <span className="flex items-center gap-1 text-red-500">
                    <Heart size={10} fill="currentColor" /> 983
                  </span>
                </div>
              </div>
            </div>

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
            {infiniteImages.map((src, idx) => {
              const isVideo = src.endsWith('.mp4') || src.includes('.mp4');
              return (
                <div key={idx} className="bg-white rounded-lg border border-gray-100 overflow-hidden shadow-sm p-3 relative">
                  <span className="absolute top-4 right-4 bg-indigo-50 text-indigo-600 text-[10px] px-2 py-0.5 rounded font-bold font-mono">
                    Dynamic #{idx + 1} ({isVideo ? 'Video' : 'Image'})
                  </span>

                  {isVideo ? (
                    <video
                      src={src}
                      controls
                      playsInline
                      className="w-full h-64 object-cover rounded-md cursor-pointer mb-2 border border-gray-100"
                      onContextMenu={(e) => handleImageRightClick(e, src)}
                    />
                  ) : (
                    <img 
                      src={src}
                      data-original={src.includes('unsplash.com') ? src.replace('&w=600', '&w=2000') : src}
                      alt={`Dynamically injected infinite picture item ${idx + 1}`}
                      className="w-full h-64 object-cover rounded-md cursor-pointer mb-2 hover:brightness-95 transition"
                      onContextMenu={(e) => handleImageRightClick(e, src.includes('unsplash.com') ? src.replace('&w=600', '&w=2000') : src)}
                    />
                  )}
                  
                  <div className="flex items-center justify-between text-[11px] text-gray-400 mt-2">
                    <span>Injected: {new Date().toLocaleTimeString()}</span>
                    <span 
                      onClick={(e) => handleImageRightClick(e, src)}
                      className="text-indigo-600 font-semibold cursor-pointer flex items-center gap-0.5"
                    >
                      Trigger Loupe <ExternalLink size={10} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );

    default:
      return null;
  }
}
