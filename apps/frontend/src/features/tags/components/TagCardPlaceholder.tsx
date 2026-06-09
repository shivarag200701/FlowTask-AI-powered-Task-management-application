function TagCardPlaceholder() {
  return (
    <div className="flex items-center  justify-between w-full h-14 py-2.5 px-4 animate-pulse gap-5 sm:gap-8 md:gap-12">
      <div className="flex w-full h-5 gap-4">
        <div className="h-5 w-5 bg-neutral-200 rounded-md " />
        <div className="w-16 h-5 bg-neutral-200 rounded-md" />
      </div>
      <div className="flex items-center gap-4 ">
        <div className="w-16 h-5 bg-neutral-200 rounded-md" />
        <div className="w-8" />
      </div>
    </div>
  );
}

export default TagCardPlaceholder;
