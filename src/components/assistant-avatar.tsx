"use client";

type AssistantAvatarState = "idle" | "thinking" | "talking";

export function AssistantAvatar({
  state = "idle",
  size = "md",
  showBubble = false
}: {
  state?: AssistantAvatarState;
  size?: "sm" | "md";
  showBubble?: boolean;
}) {
  const sizeClass = size === "sm" ? "h-14 w-14" : "h-20 w-20";
  const bubbleText = state === "thinking" ? "..." : state === "talking" ? "AI" : "Z";

  return (
    <span className={`assistant-avatar relative inline-grid shrink-0 place-items-center ${sizeClass}`} data-state={state}>
      <style>{`
        .assistant-avatar .sprite {
          width: 100%;
          height: 100%;
          image-rendering: pixelated;
          shape-rendering: crispEdges;
          animation: assistant-soft-bob 2.4s ease-in-out infinite;
        }

        .assistant-avatar .blink {
          animation: assistant-blink 5s steps(1, end) infinite;
        }

        .assistant-avatar[data-state="talking"] .talk {
          animation: assistant-talk 0.42s steps(2, end) infinite;
        }

        .assistant-avatar[data-state="thinking"] .leaf,
        .assistant-avatar[data-state="talking"] .leaf {
          animation: assistant-leaf 2.6s ease-in-out infinite;
          transform-origin: 78px 27px;
        }

        .assistant-avatar[data-state="thinking"] .staff,
        .assistant-avatar[data-state="talking"] .staff {
          animation: assistant-staff 3s ease-in-out infinite;
          transform-origin: 74px 92px;
        }

        @keyframes assistant-soft-bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }

        @keyframes assistant-blink {
          0%, 92%, 100% { opacity: 1; }
          95% { opacity: 0; }
        }

        @keyframes assistant-talk {
          0%, 100% { opacity: 1; fill: #5c352e; }
          50% { opacity: 0.45; fill: #8a4a3d; }
        }

        @keyframes assistant-leaf {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(8deg); }
        }

        @keyframes assistant-staff {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-2deg); }
        }
      `}</style>
      <svg className="sprite" viewBox="0 0 160 160" role="img" aria-label="ZBlog 像素小助手">
        <defs>
          <filter id="assistantPixelShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="5" stdDeviation="0" floodColor="#8a6b43" floodOpacity="0.28" />
          </filter>
        </defs>

        <g filter="url(#assistantPixelShadow)">
          <rect x="48" y="138" width="64" height="8" fill="#8c9b66" opacity="0.42" />

          <g className="staff">
            <rect x="36" y="43" width="5" height="86" fill="#6e4a2f" />
            <rect x="32" y="31" width="13" height="4" fill="#5a3a25" />
            <rect x="27" y="35" width="22" height="22" fill="#805b34" />
            <rect x="31" y="39" width="14" height="14" fill="#d9e2d2" />
            <rect x="35" y="43" width="6" height="6" fill="#8da63a" />
            <rect x="27" y="35" width="4" height="22" fill="#4f3a26" />
            <rect x="45" y="35" width="4" height="22" fill="#4f3a26" />
            <rect x="31" y="31" width="14" height="4" fill="#4f3a26" />
            <rect x="31" y="57" width="14" height="4" fill="#4f3a26" />
          </g>

          <rect x="55" y="22" width="50" height="10" fill="#58672e" />
          <rect x="48" y="30" width="64" height="10" fill="#7f9632" />
          <rect x="43" y="40" width="70" height="13" fill="#b7c94a" />
          <rect x="50" y="52" width="55" height="9" fill="#d3d95b" />
          <rect x="98" y="28" width="14" height="10" fill="#3e4928" />
          <rect x="106" y="38" width="14" height="21" fill="#3e4928" />
          <rect x="114" y="51" width="9" height="13" fill="#3e4928" />

          <g className="leaf">
            <rect x="53" y="20" width="8" height="5" fill="#74a33e" />
            <rect x="60" y="15" width="7" height="8" fill="#74a33e" />
            <rect x="61" y="23" width="5" height="5" fill="#b99035" />
          </g>

          <rect x="49" y="58" width="10" height="45" fill="#c98a45" />
          <rect x="101" y="58" width="10" height="45" fill="#c98a45" />
          <rect x="56" y="55" width="48" height="38" fill="#ffdcb4" />
          <rect x="56" y="55" width="13" height="16" fill="#e2ad58" />
          <rect x="69" y="52" width="34" height="10" fill="#e2ad58" />
          <rect x="93" y="61" width="11" height="16" fill="#e2ad58" />
          <rect x="54" y="88" width="52" height="5" fill="#e2ad58" />

          <rect x="64" y="72" width="9" height="10" fill="#f7fff5" />
          <rect x="88" y="72" width="9" height="10" fill="#f7fff5" />
          <rect className="blink" x="67" y="75" width="4" height="5" fill="#247954" />
          <rect className="blink" x="91" y="75" width="4" height="5" fill="#247954" />
          <rect x="69" y="73" width="2" height="2" fill="#ffffff" />
          <rect x="93" y="73" width="2" height="2" fill="#ffffff" />
          <rect x="61" y="86" width="5" height="3" fill="#eea28c" opacity="0.45" />
          <rect x="95" y="86" width="5" height="3" fill="#eea28c" opacity="0.45" />
          <rect className="talk" x="76" y="90" width="8" height="3" fill="#5c352e" />

          <rect x="49" y="95" width="62" height="15" fill="#252d27" />
          <rect x="52" y="110" width="56" height="23" fill="#252d27" />
          <rect x="62" y="101" width="36" height="31" fill="#6f8728" />
          <rect x="72" y="101" width="17" height="18" fill="#9dac3d" />
          <rect x="76" y="121" width="9" height="6" fill="#b8c45d" />
          <rect x="76" y="104" width="8" height="8" fill="#e7e7c8" />
          <rect x="72" y="111" width="16" height="4" fill="#e7e7c8" />

          <rect x="43" y="100" width="9" height="25" fill="#ffdcb4" />
          <rect x="108" y="100" width="9" height="25" fill="#ffdcb4" />
          <rect x="39" y="120" width="12" height="8" fill="#ffdcb4" />
          <rect x="109" y="120" width="12" height="8" fill="#ffdcb4" />

          <rect x="59" y="132" width="16" height="15" fill="#242b28" />
          <rect x="88" y="132" width="16" height="15" fill="#242b28" />
          <rect x="55" y="145" width="22" height="7" fill="#1b201e" />
          <rect x="86" y="145" width="22" height="7" fill="#1b201e" />
          <rect x="63" y="139" width="4" height="3" fill="#cfd7bf" />
          <rect x="95" y="139" width="4" height="3" fill="#cfd7bf" />

          <rect x="105" y="96" width="17" height="21" fill="#fff5d8" />
          <rect x="108" y="100" width="11" height="3" fill="#b99035" />
          <rect x="108" y="107" width="11" height="3" fill="#d0d9c8" />
          <rect x="108" y="114" width="8" height="3" fill="#d0d9c8" />
        </g>
      </svg>
      {showBubble ? (
        <span className="absolute -right-1 -top-1 rounded-[8px] border border-ink/20 bg-white px-1.5 py-0.5 text-[10px] font-black leading-none text-pine shadow-sm">
          {bubbleText}
        </span>
      ) : null}
    </span>
  );
}
