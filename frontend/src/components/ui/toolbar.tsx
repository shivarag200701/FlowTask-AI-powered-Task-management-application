import AnimatedSizeContainer from "./animated-size-container";

export const BottomToolbar = ({ text }: { text?: string }) => {
  return (
    <div className="fixed bottom-4 left-0 z-10 w-full sm:max-[1372px]:w-[calc(100%-150px)] md:left-[304px] md:w-[calc(100%-304px)] md:max-[1372px]:w-[calc(100%-304px-150px)]">
      <div className="relative left-1/2 w-full max-w-[768px] -translate-x-1/2 px-5">
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white filter-[drop-shadow(0_5px_8px_#222A351d)] px-4 py-3.5">
          <AnimatedSizeContainer height>{text}</AnimatedSizeContainer>
        </div>
      </div>
    </div>
  );
};
