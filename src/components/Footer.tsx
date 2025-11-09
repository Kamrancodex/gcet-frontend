export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200">
      <div className="container-narrow py-10 text-slate-600 text-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-full bg-sky-500/10 ring-1 ring-sky-500/30 grid place-items-center text-sky-600 font-bold">
              G
            </span>
            <span className="text-slate-900 font-semibold">GCET</span>
          </div>
          <div className="opacity-80">
            © {new Date().getFullYear()} GCET. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
