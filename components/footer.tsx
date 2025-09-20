export default function Footer() {
  return (
    <footer className="mt-16 border-t border-black/10 dark:border-white/10">
      <div className="p-6 grid gap-6 sm:grid-cols-3">
        <div>
          <h4 className="font-bold">FoodAi</h4>
          <p className="opacity-70 text-sm">Älykäs ruoka – alennukset yhdestä paikasta.</p>
        </div>
        <nav className="grid gap-1 text-sm">
          <a className="link" href="/about">Tietoa</a>
          <a className="link" href="/privacy">Tietosuoja</a>
          <a className="link" href="/account/data">Tiedon vienti/poisto</a>
        </nav>
        <div className="grid gap-2">
          <form className="flex gap-2">
            <input placeholder="Sähköposti" className="border rounded-2xl px-3 py-2 flex-1" />
            <button className="btn btn-primary">Tilaa</button>
          </form>
          <div className="text-sm">
            Kieli: <a className="link" href="/?locale=fi">FI</a> · <a className="link" href="/?locale=en">EN</a>
          </div>
        </div>
      </div>
    </footer>
  );
}