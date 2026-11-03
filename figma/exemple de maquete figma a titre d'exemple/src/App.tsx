import { useEffect, useMemo, useState, type ReactNode } from "react"
import {
  AppleLogo,
  Archive,
  ArrowLeft,
  CalendarBlank,
  CaretDown,
  CaretRight,
  ChartBar,
  Check,
  CheckCircle,
  Copy,
  CurrencyCircleDollar,
  DotsThree,
  DownloadSimple,
  Eye,
  ForkKnife,
  Gear,
  Globe,
  GoogleLogo,
  House,
  ImageSquare,
  Leaf,
  LockKey,
  MagnifyingGlass,
  Minus,
  Palette,
  Plus,
  Printer,
  QrCode,
  ShareNetwork,
  ShoppingBag,
  SignOut,
  SlidersHorizontal,
  Sparkle,
  SquaresFour,
  Storefront,
  UploadSimple,
  UserCircle,
  X,
  XCircle,
} from "@phosphor-icons/react"

type View = "orders" | "menu" | "qr" | "stats" | "settings" | "public"
type OrderStatus = "En attente" | "Terminée" | "Annulée"
type Dish = {
  name: string
  description: string
  price: number
  image: string
  category: string
  available: boolean
}
type Order = {
  id: string
  table: string
  time: string
  items: string
  total: number
  status: OrderStatus
  note?: string
  date: string
}
type PublicStyle = {
  font: string
  color: string
  rounded: boolean
  banner: string
}

const photos = {
  chicken:
    "https://images.unsplash.com/photo-1722612114194-91e93928baa7?auto=format&fit=crop&w=900&q=86",
  bowl: "https://images.unsplash.com/photo-1722612114203-17110f747244?auto=format&fit=crop&w=900&q=86",
  table:
    "https://images.unsplash.com/photo-1578727401711-e9fcd2fbf270?auto=format&fit=crop&w=1400&q=86",
}

const initialDishes: Dish[] = [
  {
    name: "Poulet braisé signature",
    description: "Marinade maison, plantain rôti et riz parfumé",
    price: 6500,
    image: photos.chicken,
    category: "Plats principaux",
    available: true,
  },
  {
    name: "Bowl végétal du marché",
    description: "Légumes grillés, avocat, céréales et sauce citron",
    price: 5000,
    image: photos.bowl,
    category: "Plats principaux",
    available: true,
  },
  {
    name: "Poisson braisé entier",
    description: "Poisson du jour, condiments frais et alloco",
    price: 8500,
    image: photos.table,
    category: "Grillades",
    available: false,
  },
]

const initialOrders: Order[] = [
  {
    id: "R-1",
    table: "Terrasse 4",
    time: "Il y a 3 min",
    items: "2 × Poulet braisé, 1 × Bissap",
    total: 9500,
    status: "En attente",
    note: "Sans piment, s’il vous plaît.",
    date: "Aujourd’hui · 18 juin 2026",
  },
  {
    id: "R-2",
    table: "VIP-2",
    time: "Il y a 8 min",
    items: "1 × Bowl végétal, 2 × Eau minérale",
    total: 7000,
    status: "En attente",
    date: "Aujourd’hui · 18 juin 2026",
  },
  {
    id: "R-3",
    table: "T1",
    time: "Il y a 14 min",
    items: "1 × Poisson braisé, 1 × Alloco",
    total: 11500,
    status: "En attente",
    date: "Aujourd’hui · 18 juin 2026",
  },
  {
    id: "R-4",
    table: "T8",
    time: "Hier à 21:18",
    items: "2 × Ndolé à la viande",
    total: 8000,
    status: "Terminée",
    date: "Hier · 17 juin 2026",
  },
  {
    id: "R-5",
    table: "T3",
    time: "16 juin à 19:42",
    items: "1 × Poulet braisé signature",
    total: 6500,
    status: "Annulée",
    date: "16 juin 2026",
  },
]

const fallbackCountries = [
  { name: "Cameroun", code: "CM", currency: "XAF", symbol: "FCFA" },
  { name: "Côte d’Ivoire", code: "CI", currency: "XOF", symbol: "FCFA" },
  { name: "France", code: "FR", currency: "EUR", symbol: "€" },
  { name: "États-Unis", code: "US", currency: "USD", symbol: "$" },
  { name: "Royaume-Uni", code: "GB", currency: "GBP", symbol: "£" },
]

function money(value: number, currency: string) {
  return `${value.toLocaleString("fr-FR")} ${currency}`
}

function Button({
  children,
  variant = "primary",
  icon,
  onClick,
  className = "",
  disabled,
  type = "button",
}: {
  children: ReactNode
  variant?: "primary" | "secondary" | "ghost" | "danger"
  icon?: ReactNode
  onClick?: () => void
  className?: string
  disabled?: boolean
  type?: "button" | "submit"
}) {
  return (
    <button
      type={type}
      className={`button button-${variant} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {icon}
      {children}
    </button>
  )
}

function IconButton({
  label,
  children,
  onClick,
  className = "",
}: {
  label: string
  children: ReactNode
  onClick?: () => void
  className?: string
}) {
  return (
    <button
      className={`icon-button ${className}`}
      aria-label={label}
      title={label}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

function Badge({ status }: { status: OrderStatus | "Disponible" | "Épuisé" }) {
  return (
    <span className={`badge badge-${status.toLowerCase().replace(" ", "-")}`}>
      <i />
      {status}
    </span>
  )
}

function Title({
  eyebrow,
  children,
  description,
}: {
  eyebrow?: string
  children: ReactNode
  description?: string
}) {
  return (
    <div className="title-block">
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h1>{children}</h1>
      {description && <p>{description}</p>}
    </div>
  )
}

function Field({
  label,
  placeholder,
  value,
  type = "text",
  onChange,
}: {
  label: string
  placeholder?: string
  value?: string
  type?: string
  onChange?: (value: string) => void
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={onChange ? value : undefined}
        defaultValue={onChange ? undefined : value}
        onChange={(event) => onChange?.(event.target.value)}
      />
    </label>
  )
}

function Modal({
  children,
  onClose,
  wide = false,
  flow = false,
}: {
  children: ReactNode
  onClose: () => void
  wide?: boolean
  flow?: boolean
}) {
  return (
    <div
      className={`modal-layer ${flow ? "flow-layer" : ""}`}
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        className={`modal ${wide ? "modal-wide" : ""} ${
          flow ? "flow-modal" : ""
        }`}
        role="dialog"
        aria-modal="true"
        onMouseDown={(event) => event.stopPropagation()}
      >
        {children}
      </section>
    </div>
  )
}

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand ${compact ? "brand-compact" : ""}`}>
      <img src="/assets/restio-mark.png" alt="" />
      {!compact && <span>Restio</span>}
    </div>
  )
}

function Sidebar({
  view,
  setView,
  onLogout,
}: {
  view: View
  setView: (view: View) => void
  onLogout: () => void
}) {
  const [accountMenu, setAccountMenu] = useState(false)
  const links: Array<{ id: View label: string icon: ReactNode }> = [
    { id: "orders", label: "Commandes", icon: <SquaresFour size={19} /> },
    { id: "menu", label: "Menu", icon: <ForkKnife size={19} /> },
    { id: "qr", label: "QR code", icon: <QrCode size={19} /> },
    { id: "stats", label: "Statistiques", icon: <ChartBar size={19} /> },
    { id: "settings", label: "Paramètres", icon: <Gear size={19} /> },
  ]
  return (
    <aside className="sidebar">
      <Logo />
      <div className="restaurant-switcher">
        <span className="restaurant-avatar">M</span>
        <span>
          <b>Maison Naya</b>
          <small>Yaoundé, Cameroun</small>
        </span>
      </div>
      <nav>
        <span className="nav-label">Espace de travail</span>
        {links.map((link) => (
          <button
            key={link.id}
            className={view === link.id ? "active" : ""}
            onClick={() => setView(link.id)}
          >
            {link.icon}
            <span>{link.label}</span>
            {link.id === "orders" && <em>3</em>}
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom">
        {accountMenu && (
          <button className="logout-popover" onClick={onLogout}>
            <SignOut /> Se déconnecter
          </button>
        )}
        <button
          className="profile"
          onClick={() => setAccountMenu(!accountMenu)}
        >
          <span className="profile-avatar">AN</span>
          <span>
            <b>Aïcha Ndom</b>
            <small>Propriétaire</small>
          </span>
          <DotsThree size={20} />
        </button>
      </div>
    </aside>
  )
}

function Header({ openPublic }: { openPublic: () => void }) {
  return (
    <header className="topbar">
      <div className="mobile-restio">
        <Logo />
      </div>
      <div className="desktop-spacer" />
      <div className="top-actions">
        <Button
          variant="secondary"
          icon={<Eye size={17} />}
          onClick={openPublic}
        >
          Aperçu public
        </Button>
      </div>
    </header>
  )
}

function QuantityControl({
  value,
  onChange,
}: {
  value: number
  onChange: (value: number) => void
}) {
  return (
    <div className="quantity">
      <IconButton
        label="Retirer"
        onClick={() => onChange(Math.max(0, value - 1))}
      >
        <Minus />
      </IconButton>
      <b>{value}</b>
      <IconButton label="Ajouter" onClick={() => onChange(value + 1)}>
        <Plus />
      </IconButton>
    </div>
  )
}

function NewOrderFlow({
  dishes,
  currency,
  onClose,
  onCreate,
}: {
  dishes: Dish[]
  currency: string
  onClose: () => void
  onCreate: (order: Omit<Order, "id">) => void
}) {
  const [step, setStep] = useState(1)
  const [quantities, setQuantities] = useState(dishes.map(() => 0))
  const [note, setNote] = useState("")
  const [table, setTable] = useState("")
  const total = quantities.reduce(
    (sum, quantity, index) => sum + quantity * dishes[index].price,
    0,
  )
  const count = quantities.reduce((sum, quantity) => sum + quantity, 0)
  const submit = () => {
    if (!table.trim()) return
    const items = dishes
      .map((dish, index) =>
        quantities[index] ? `${quantities[index]} × ${dish.name}` : "",
      )
      .filter(Boolean)
      .join(", ")
    onCreate({
      table,
      time: "À l’instant",
      items,
      total,
      status: "En attente",
      note,
      date: "Aujourd’hui · 18 juin 2026",
    })
  }
  return (
    <Modal onClose={onClose} wide flow>
      <div className="drawer-header">
        <div>
          <span className="eyebrow">NOUVELLE COMMANDE · ÉTAPE {step}/2</span>
          <h2>
            {step === 1 ? "Composer la commande" : "Finaliser la commande"}
          </h2>
        </div>
        <IconButton label="Fermer" onClick={onClose}>
          <X />
        </IconButton>
      </div>
      {step === 1 ? (
        <div className="order-builder">
          <div className="builder-dishes">
            {dishes
              .filter((dish) => dish.available)
              .map((dish, index) => (
                <article key={dish.name}>
                  <img src={dish.image} alt="" />
                  <span>
                    <b>{dish.name}</b>
                    <small>{money(dish.price, currency)}</small>
                  </span>
                  <QuantityControl
                    value={quantities[index]}
                    onChange={(value) =>
                      setQuantities(
                        quantities.map((quantity, i) =>
                          i === index ? value : quantity,
                        ),
                      )
                    }
                  />
                </article>
              ))}
          </div>
          <label className="field">
            <span>
              Note client <em>Facultatif</em>
            </span>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Ex. Sans piment, cuisson bien grillée…"
            />
          </label>
        </div>
      ) : (
        <div className="order-review">
          <div className="mini-summary">
            <span>
              <small>ARTICLES</small>
              <b>{count}</b>
            </span>
            <span>
              <small>TOTAL</small>
              <b>{money(total, currency)}</b>
            </span>
          </div>
          <div className="selected-preview">
            {dishes.map(
              (dish, index) =>
                quantities[index] > 0 && (
                  <span key={dish.name}>
                    <img src={dish.image} alt="" />
                    <b>{quantities[index]}</b>
                  </span>
                ),
            )}
          </div>
          {note && (
            <div className="note">
              <Sparkle />
              <span>
                <b>Note client</b>
                {note}
              </span>
            </div>
          )}
          <Field
            label="Numéro de table"
            placeholder="Ex. T1, VIP-2, Terrasse 4"
            value={table}
            onChange={setTable}
          />
          <p className="field-help">Le numéro de table est obligatoire.</p>
        </div>
      )}
      <div className="modal-actions">
        {step === 2 && (
          <Button variant="secondary" onClick={() => setStep(1)}>
            Retour
          </Button>
        )}
        <Button
          disabled={step === 1 ? count === 0 : !table.trim()}
          onClick={() => (step === 1 ? setStep(2) : submit())}
        >
          {step === 1 ? "Suivant" : "Confirmer la commande"}
        </Button>
      </div>
    </Modal>
  )
}

function OrdersPage({
  orders,
  setOrders,
  dishes,
  currency,
}: {
  orders: Order[]
  setOrders: (orders: Order[]) => void
  dishes: Dish[]
  currency: string
}) {
  const [filter, setFilter] = useState<"En cours" | "Toutes">("En cours")
  const [selected, setSelected] = useState<Order | null>(null)
  const [newOrder, setNewOrder] = useState(false)
  const visible =
    filter === "En cours"
      ? orders.filter((order) => order.status === "En attente")
      : orders
  const finish = (status: OrderStatus) => {
    if (!selected) return
    setOrders(
      orders.map((order) =>
        order.id === selected.id ? { ...order, status } : order,
      ),
    )
    setSelected(null)
  }
  return (
    <>
      <main className="page">
        <div className="page-heading">
          <Title eyebrow="Aujourd’hui, 18 juin">Commandes</Title>
          <Button icon={<Plus size={18} />} onClick={() => setNewOrder(true)}>
            Nouvelle commande
          </Button>
        </div>
        <div className="metric-grid orders-metrics">
          <article className="metric-card featured">
            <span className="metric-icon">
              <ForkKnife />
            </span>
            <div>
              <small>À préparer</small>
              <strong>
                {orders.filter((order) => order.status === "En attente").length}
              </strong>
              <p>Priorité au service en cours</p>
            </div>
          </article>
          <article className="metric-card">
            <span className="metric-icon">
              <CheckCircle />
            </span>
            <div>
              <small>Terminées aujourd’hui</small>
              <strong>24</strong>
              <p>
                <b>+12%</b> vs. hier
              </p>
            </div>
          </article>
          <article className="metric-card">
            <span className="metric-icon">
              <ShoppingBag />
            </span>
            <div>
              <small>Valeur moyenne</small>
              <strong>{money(8250, currency)}</strong>
              <p>Sur 28 commandes</p>
            </div>
          </article>
          <article className="metric-card">
            <span className="metric-icon">
              <CurrencyCircleDollar />
            </span>
            <div>
              <small>Ventes totales du jour</small>
              <strong>{money(231000, currency)}</strong>
              <p>
                <b>+8,4%</b> vs. hier
              </p>
            </div>
          </article>
        </div>
        <section className="content-section">
          <div className="section-toolbar">
            <div>
              <h2>Flux de commandes</h2>
              <p>Les commandes les plus anciennes apparaissent en premier.</p>
            </div>
            <div className="segmented">
              {(["En cours", "Toutes"] as const).map((item) => (
                <button
                  key={item}
                  className={filter === item ? "active" : ""}
                  onClick={() => setFilter(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className="order-list">
            {visible.map((order, index) => (
              <article
                className={`order-card ${
                  index === 0 && filter === "En cours" ? "priority" : ""
                }`}
                key={order.id}
                onClick={() => setSelected(order)}
              >
                <div className="order-main">
                  <span className="order-time">{order.time}</span>
                  <div className="order-title">
                    <strong>{order.id}</strong>
                    <Badge status={order.status} />
                  </div>
                  <p>{order.items}</p>
                </div>
                <div className="order-table">
                  <small>TABLE</small>
                  <strong>{order.table}</strong>
                </div>
                <div className="order-total">
                  <small>TOTAL</small>
                  <strong>{money(order.total, currency)}</strong>
                </div>
                <CaretRight className="order-chevron" />
              </article>
            ))}
          </div>
        </section>
      </main>
      {selected && (
        <div className="drawer-layer" onMouseDown={() => setSelected(null)}>
          <aside
            className="order-drawer"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="drawer-header">
              <div>
                <span className="eyebrow">DÉTAIL DE LA COMMANDE</span>
                <h2>{selected.id}</h2>
              </div>
              <IconButton label="Fermer" onClick={() => setSelected(null)}>
                <X />
              </IconButton>
            </div>
            <div className="order-meta">
              <span>
                <small>TABLE</small>
                <b>{selected.table}</b>
              </span>
              <span>
                <small>REÇUE</small>
                <b>{selected.time}</b>
              </span>
              <Badge status={selected.status} />
            </div>
            <h3>Articles</h3>
            <div className="line-items">
              {selected.items.split(", ").map((item) => (
                <div key={item}>
                  <span className="qty">{item.split(" ")[0]}</span>
                  <span>
                    <b>{item.substring(item.indexOf("×") + 1)}</b>
                  </span>
                </div>
              ))}
            </div>
            <div className="total-line">
              <span>Total</span>
              <strong>{money(selected.total, currency)}</strong>
            </div>
            {selected.note && (
              <div className="note">
                <Sparkle />
                <span>
                  <b>Note client</b>
                  {selected.note}
                </span>
              </div>
            )}
            <div className="drawer-actions">
              <Button
                variant="secondary"
                icon={<XCircle />}
                onClick={() => finish("Annulée")}
              >
                Annuler
              </Button>
              <Button icon={<Check />} onClick={() => finish("Terminée")}>
                Marquer terminée
              </Button>
            </div>
          </aside>
        </div>
      )}
      {newOrder && (
        <NewOrderFlow
          dishes={dishes}
          currency={currency}
          onClose={() => setNewOrder(false)}
          onCreate={(order) => {
            setOrders([...orders, { ...order, id: `R-${orders.length + 1}` }])
            setNewOrder(false)
          }}
        />
      )}
    </>
  )
}

function DishForm({
  dish,
  categories,
  currency,
  onClose,
  onSave,
}: {
  dish?: Dish
  categories: string[]
  currency: string
  onClose: () => void
  onSave: (dish: Dish) => void
}) {
  const [form, setForm] = useState<Dish>(
    dish || {
      name: "",
      description: "",
      price: 0,
      image: photos.chicken,
      category: categories[0] || "Plats principaux",
      available: true,
    },
  )
  return (
    <Modal onClose={onClose} wide>
      <div className="drawer-header">
        <div>
          <span className="eyebrow">
            {dish ? "MODIFIER LE PLAT" : "NOUVEAU PLAT"}
          </span>
          <h2>{dish ? form.name : "Ajouter à votre menu"}</h2>
        </div>
        <IconButton label="Fermer" onClick={onClose}>
          <X />
        </IconButton>
      </div>
      <div className="dish-form">
        <label className="image-upload image-preview">
          <img src={form.image} alt="" />
          <span>
            <ImageSquare /> Changer l’image
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={(event) =>
              event.target.files?.[0] &&
              setForm({
                ...form,
                image: URL.createObjectURL(event.target.files[0]),
              })
            }
          />
        </label>
        <div className="form-stack">
          <Field
            label="Nom du plat"
            value={form.name}
            onChange={(name) => setForm({ ...form, name })}
          />
          <label className="field">
            <span>Description</span>
            <textarea
              value={form.description}
              onChange={(event) =>
                setForm({ ...form, description: event.target.value })
              }
            />
          </label>
          <div className="form-row">
            <Field
              label={`Prix (${currency})`}
              value={String(form.price || "")}
              onChange={(price) => setForm({ ...form, price: Number(price) })}
            />
            <label className="field">
              <span>Catégorie</span>
              <select
                value={form.category}
                onChange={(event) =>
                  setForm({ ...form, category: event.target.value })
                }
              >
                {categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </label>
          </div>
          <label className="availability">
            <span>
              <b>Disponible à la commande</b>
              <small>Les clients peuvent ajouter ce plat au panier.</small>
            </span>
            <button
              className={`switch ${form.available ? "on" : ""}`}
              onClick={() => setForm({ ...form, available: !form.available })}
            >
              <i />
            </button>
          </label>
        </div>
      </div>
      <div className="modal-actions">
        <Button variant="secondary" onClick={onClose}>
          Annuler
        </Button>
        <Button
          disabled={!form.name || !form.price}
          onClick={() => onSave(form)}
        >
          {dish ? "Enregistrer" : "Créer le plat"}
        </Button>
      </div>
    </Modal>
  )
}

function MenuPage({
  dishes,
  setDishes,
  currency,
}: {
  dishes: Dish[]
  setDishes: (dishes: Dish[]) => void
  currency: string
}) {
  const [categories, setCategories] = useState([
    "Entrées",
    "Plats principaux",
    "Grillades",
    "Accompagnements",
    "Desserts",
    "Boissons",
  ])
  const [category, setCategory] = useState("Tous les plats")
  const [categoryModal, setCategoryModal] = useState(false)
  const [categoryName, setCategoryName] = useState("")
  const [editing, setEditing] = useState<Dish | null | undefined>(undefined)
  const [filterOpen, setFilterOpen] = useState(false)
  const [availability, setAvailability] = useState("Tous")
  const [maxPrice, setMaxPrice] = useState(20000)
  const visible = dishes.filter(
    (dish) =>
      (category === "Tous les plats" || dish.category === category) &&
      (availability === "Tous" ||
        (availability === "Disponibles" ? dish.available : !dish.available)) &&
      dish.price <= maxPrice,
  )
  const saveDish = (nextDish: Dish) => {
    setDishes(
      editing
        ? dishes.map((dish) => (dish === editing ? nextDish : dish))
        : [...dishes, nextDish],
    )
    setEditing(undefined)
  }
  return (
    <main className="page">
      <div className="page-heading">
        <Title eyebrow="Carte active">
          Votre menu <span className="title-count">{dishes.length} plats</span>
        </Title>
        <div className="heading-actions">
          <Button icon={<Plus />} onClick={() => setCategoryModal(true)}>
            Ajouter une catégorie
          </Button>
          <Button icon={<Plus />} onClick={() => setEditing(null)}>
            Ajouter un plat
          </Button>
        </div>
      </div>
      <div className="menu-summary">
        <div>
          <span className="summary-icon">
            <ForkKnife />
          </span>
          <span>
            <small>Plats disponibles</small>
            <b>{dishes.filter((dish) => dish.available).length}</b>
          </span>
        </div>
        <div>
          <span className="summary-icon warn">
            <XCircle />
          </span>
          <span>
            <small>Plats épuisés</small>
            <b>{dishes.filter((dish) => !dish.available).length}</b>
          </span>
        </div>
        <div className="menu-tip">
          <Leaf />
          <span>
            <b>Votre carte est prête pour le service</b>
            <small>Dernière modification il y a 24 min</small>
          </span>
        </div>
      </div>
      <section className="menu-workspace">
        <aside className="category-panel">
          <div className="category-heading">
            <span>CATÉGORIES</span>
            <IconButton
              label="Ajouter une catégorie"
              onClick={() => setCategoryModal(true)}
            >
              <Plus />
            </IconButton>
          </div>
          {["Tous les plats", ...categories].map((item) => (
            <button
              className={category === item ? "active" : ""}
              key={item}
              onClick={() => setCategory(item)}
            >
              <span>{item}</span>
              <em>
                {item === "Tous les plats"
                  ? dishes.length
                  : dishes.filter((dish) => dish.category === item).length}
              </em>
            </button>
          ))}
        </aside>
        <div className="dish-content">
          <div className="dish-toolbar">
            <div className="search-box">
              <MagnifyingGlass />
              <input placeholder="Rechercher un plat…" />
            </div>
            <Button
              variant="secondary"
              icon={<SlidersHorizontal />}
              onClick={() => setFilterOpen(true)}
            >
              Filtrer
            </Button>
          </div>
          <div className="dish-grid">
            {visible.map((dish) => (
              <article className="dish-card" key={dish.name}>
                <div className="dish-image">
                  <img src={dish.image} alt={dish.name} />
                  <Badge status={dish.available ? "Disponible" : "Épuisé"} />
                  <IconButton
                    label="Modifier le plat"
                    onClick={() => setEditing(dish)}
                  >
                    <DotsThree />
                  </IconButton>
                </div>
                <div className="dish-body">
                  <small>{dish.category}</small>
                  <h3>{dish.name}</h3>
                  <p>{dish.description}</p>
                  <div>
                    <strong>{money(dish.price, currency)}</strong>
                    <button
                      className={`switch ${dish.available ? "on" : ""}`}
                      onClick={() =>
                        setDishes(
                          dishes.map((item) =>
                            item === dish
                              ? { ...item, available: !item.available }
                              : item,
                          ),
                        )
                      }
                    >
                      <i />
                    </button>
                  </div>
                </div>
              </article>
            ))}
            <button className="add-dish-card" onClick={() => setEditing(null)}>
              <span>
                <Plus />
              </span>
              <b>Ajouter un plat</b>
              <small>Complétez votre carte</small>
            </button>
          </div>
        </div>
      </section>
      {editing !== undefined && (
        <DishForm
          dish={editing || undefined}
          categories={categories}
          currency={currency}
          onClose={() => setEditing(undefined)}
          onSave={saveDish}
        />
      )}
      {categoryModal && (
        <Modal onClose={() => setCategoryModal(false)}>
          <div className="drawer-header">
            <div>
              <span className="eyebrow">NOUVELLE CATÉGORIE</span>
              <h2>Ajouter une catégorie</h2>
            </div>
            <IconButton label="Fermer" onClick={() => setCategoryModal(false)}>
              <X />
            </IconButton>
          </div>
          <Field
            label="Nom de la catégorie"
            placeholder="Ex. Menus du midi"
            value={categoryName}
            onChange={setCategoryName}
          />
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setCategoryModal(false)}>
              Annuler
            </Button>
            <Button
              disabled={!categoryName.trim()}
              onClick={() => {
                setCategories([...categories, categoryName.trim()])
                setCategoryName("")
                setCategoryModal(false)
              }}
            >
              Ajouter
            </Button>
          </div>
        </Modal>
      )}
      {filterOpen && (
        <Modal onClose={() => setFilterOpen(false)}>
          <div className="drawer-header">
            <div>
              <span className="eyebrow">FILTRES</span>
              <h2>Filtrer les plats</h2>
            </div>
            <IconButton label="Fermer" onClick={() => setFilterOpen(false)}>
              <X />
            </IconButton>
          </div>
          <label className="field">
            <span>Catégorie</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {["Tous les plats", ...categories].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Disponibilité</span>
            <select
              value={availability}
              onChange={(event) => setAvailability(event.target.value)}
            >
              <option>Tous</option>
              <option>Disponibles</option>
              <option>Épuisés</option>
            </select>
          </label>
          <label className="range-field">
            <span>
              Prix maximum <b>{money(maxPrice, currency)}</b>
            </span>
            <input
              type="range"
              min="1000"
              max="20000"
              step="500"
              value={maxPrice}
              onChange={(event) => setMaxPrice(Number(event.target.value))}
            />
          </label>
          <div className="modal-actions">
            <Button
              variant="secondary"
              onClick={() => {
                setCategory("Tous les plats")
                setAvailability("Tous")
                setMaxPrice(20000)
              }}
            >
              Réinitialiser
            </Button>
            <Button onClick={() => setFilterOpen(false)}>Appliquer</Button>
          </div>
        </Modal>
      )}
    </main>
  )
}

function LineChart({
  points,
  labels,
  suffix = "",
}: {
  points: number[]
  labels: string[]
  suffix?: string
}) {
  const max = Math.max(...points)
  const coordinates = points
    .map(
      (point, index) =>
        `${(index / (points.length - 1)) * 100},${92 - (point / max) * 76}`,
    )
    .join(" ")
  return (
    <div className="line-chart">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity=".18" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon
          points={`0,100 ${coordinates} 100,100`}
          fill="url(#chartFill)"
        />
        <polyline
          points={coordinates}
          fill="none"
          vectorEffect="non-scaling-stroke"
        />
        {points.map((point, index) => {
          const [x, y] = coordinates.split(" ")[index].split(",")
          return (
            <circle key={index} cx={x} cy={y} r="1.6">
              <title>
                {labels[index]} : {point.toLocaleString("fr-FR")} {suffix}
              </title>
            </circle>
          )
        })}
      </svg>
      <div>
        {labels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </div>
  )
}

function StatsPage({ dishes, currency }: { dishes: Dish[] currency: string }) {
  const [period, setPeriod] = useState("30 jours")
  const [day, setDay] = useState("Aujourd’hui")
  const [ranking, setRanking] = useState(false)
  const [insight, setInsight] = useState(false)
  return (
    <main className="page">
      <div className="page-heading">
        <Title eyebrow="Performance">Statistiques</Title>
        <label className="date-filter">
          <select
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
          >
            <option>7 jours</option>
            <option>14 jours</option>
            <option>30 jours</option>
            <option>60 jours</option>
            <option>360 jours</option>
            <option>Depuis le début</option>
          </select>
          <CaretDown />
        </label>
      </div>
      <div className="metric-grid stats-grid">
        {[
          ["Commandes", "284", "+12,4%", <ShoppingBag />],
          ["Terminées", "268", "94,3%", <CheckCircle />],
          ["Annulées", "16", "5,7%", <XCircle />],
          [
            "Chiffre d’affaires",
            money(2343000, currency),
            "+18,2%",
            <CurrencyCircleDollar />,
          ],
        ].map(([label, value, trend, icon]) => (
          <article className="metric-card" key={String(label)}>
            <span className="metric-icon">{icon}</span>
            <div>
              <small>{label}</small>
              <strong>{value}</strong>
              <p>
                <b>{trend}</b>{" "}
                {label === "Commandes" ? "vs. période préc." : ""}
              </p>
            </div>
          </article>
        ))}
      </div>
      <section className="chart-card revenue-chart">
        <div className="card-heading">
          <div>
            <h2>Évolution du chiffre d’affaires</h2>
            <p>Sur les {period.toLowerCase()}</p>
          </div>
          <span className="chart-total">{money(2343000, currency)}</span>
        </div>
        <LineChart
          points={[92, 115, 104, 148, 139, 181, 165, 207, 194, 231, 218, 266]}
          labels={[
            "1",
            "3",
            "5",
            "7",
            "9",
            "11",
            "13",
            "15",
            "17",
            "19",
            "21",
            "23",
          ]}
          suffix={currency}
        />
      </section>
      <div className="analytics-grid">
        <section className="chart-card">
          <div className="card-heading">
            <div>
              <h2>Activité par heure</h2>
              <p>Commandes reçues au cours de la journée</p>
            </div>
            <label className="date-filter compact">
              <CalendarBlank />
              <select
                value={day}
                onChange={(event) => setDay(event.target.value)}
              >
                <option>Aujourd’hui</option>
                <option>Hier</option>
                <option>Avant-hier</option>
                <option>Personnaliser…</option>
              </select>
            </label>
          </div>
          {day === "Personnaliser…" && (
            <label className="custom-date">
              <span>Sélectionner une date</span>
              <input type="date" />
            </label>
          )}
          <LineChart
            points={[3, 5, 8, 6, 12, 18, 31, 27, 15]}
            labels={[
              "10h",
              "12h",
              "14h",
              "16h",
              "18h",
              "20h",
              "21h",
              "22h",
              "23h",
            ]}
            suffix="commandes"
          />
        </section>
        <section className="popular-card">
          <div className="card-heading">
            <div>
              <h2>Plats populaires</h2>
              <p>Les plus commandés</p>
            </div>
            <span className="eyebrow">30 JOURS</span>
          </div>
          {dishes.map((dish, i) => (
            <div className="popular-item" key={dish.name}>
              <span className="rank">{i + 1}</span>
              <img src={dish.image} alt="" />
              <span>
                <b>{dish.name}</b>
                <small>{[86, 64, 51][i]} commandes</small>
              </span>
              <strong>{[30.3, 22.5, 18][i]}%</strong>
            </div>
          ))}
          <Button variant="ghost" onClick={() => setRanking(true)}>
            Voir tout le classement <CaretRight />
          </Button>
        </section>
      </div>
      <section className="insight-card">
        <span className="insight-icon">
          <Sparkle />
        </span>
        <div>
          <span className="eyebrow">INSIGHT RESTIO</span>
          <h3>Votre pic de commandes se situe entre 19h et 21h</h3>
          <p>
            Préparez vos plats les plus populaires avant 18h30 pour fluidifier
            le service.
          </p>
        </div>
        <Button variant="secondary" onClick={() => setInsight(true)}>
          Voir le détail
        </Button>
      </section>
      {ranking && (
        <Modal onClose={() => setRanking(false)} wide>
          <div className="drawer-header">
            <div>
              <span className="eyebrow">30 DERNIERS JOURS</span>
              <h2>Classement complet des plats</h2>
            </div>
            <IconButton label="Fermer" onClick={() => setRanking(false)}>
              <X />
            </IconButton>
          </div>
          <div className="ranking-table">
            {[...dishes, ...dishes].map((dish, index) => (
              <div key={`${dish.name}-${index}`}>
                <b>{index + 1}</b>
                <img src={dish.image} alt="" />
                <span>
                  <strong>{dish.name}</strong>
                  <small>{86 - index * 7} commandes</small>
                </span>
                <em>{(((86 - index * 7) / 284) * 100).toFixed(1)}%</em>
              </div>
            ))}
          </div>
        </Modal>
      )}
      {insight && (
        <Modal onClose={() => setInsight(false)}>
          <div className="confirm-icon">
            <Sparkle />
          </div>
          <h2>Anticipez le service du soir</h2>
          <p className="modal-copy">
            42% des commandes sont reçues entre 19h et 21h. Le poulet braisé
            représente près d’un tiers des plats commandés pendant ce créneau.
          </p>
          <Button className="full-button" onClick={() => setInsight(false)}>
            Compris
          </Button>
        </Modal>
      )}
    </main>
  )
}

function QrArt() {
  return (
    <div className="qr-wrap">
      <div className="fake-qr">
        {Array.from({ length: 100 }).map((_, i) => (
          <i
            key={i}
            className={
              (i < 33 && (i % 10 < 3 || i % 10 > 6)) || (i * 7) % 13 < 5
                ? "dark"
                : ""
            }
          />
        ))}
      </div>
      <span className="qr-logo">
        <img src="/assets/restio-mark.png" alt="Restio" />
      </span>
    </div>
  )
}

function QRPage() {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard?.writeText("https://restio.app/maison-naya")
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }
  const supports = [
    ["Chevalet de table", "Format A6 · À poser sur les tables", "table"],
    ["Carte d’accueil", "Format A5 · Comptoir et réception", "welcome"],
    ["Affiche vitrine", "Format A3 · Entrée du restaurant", "poster"],
    ["Bannière restaurant", "Format paysage · Événements", "banner"],
  ]
  return (
    <main className="page qr-page">
      <div className="page-heading">
        <Title eyebrow="MENU SANS CONTACT">QR code</Title>
        <div className="heading-actions">
          <Button variant="secondary" icon={<ShareNetwork />}>
            Partager
          </Button>
          <Button icon={<DownloadSimple />}>Télécharger le QR</Button>
        </div>
      </div>
      <section className="qr-hero-card">
        <div className="qr-main">
          <QrArt />
          <span>
            <small>SCANNEZ POUR COMMANDER</small>
            <b>Maison Naya</b>
          </span>
        </div>
        <div className="qr-info">
          <span className="eyebrow">LIEN PUBLIC</span>
          <h2>Votre menu, accessible en un geste.</h2>
          <p>
            Ce QR code unique ouvre le menu du restaurant. Le client renseigne
            son numéro de table au moment de commander.
          </p>
          <div className={`url-box ${copied ? "copied" : ""}`}>
            restio.app/maison-naya{" "}
            <Button
              variant="ghost"
              icon={copied ? <Check /> : <Copy />}
              onClick={copy}
            >
              {copied ? "Copié" : "Copier"}
            </Button>
          </div>
        </div>
      </section>
      <div className="section-toolbar support-heading">
        <div>
          <h2>Supports personnalisés</h2>
          <p>
            Prêts à imprimer avec votre identité, votre bannière et votre QR
            code.
          </p>
        </div>
      </div>
      <div className="support-grid">
        {supports.map(([name, description, type]) => (
          <article className={`support-card support-${type}`} key={name}>
            <div className="support-preview">
              <div>
                <span className="mini-brand">Maison Naya</span>
                <small>Découvrez notre carte</small>
                <QrArt />
              </div>
            </div>
            <div>
              <span>
                <b>{name}</b>
                <small>{description}</small>
              </span>
              <div>
                <IconButton label="Télécharger">
                  <DownloadSimple />
                </IconButton>
                <IconButton label="Imprimer">
                  <Printer />
                </IconButton>
              </div>
            </div>
          </article>
        ))}
      </div>
    </main>
  )
}

function SettingsPage({
  orders,
  currency,
  country,
  setCountry,
  setCurrency,
  publicStyle,
  setPublicStyle,
}: {
  orders: Order[]
  currency: string
  country: string
  setCountry: (country: string) => void
  setCurrency: (currency: string) => void
  publicStyle: PublicStyle
  setPublicStyle: (style: PublicStyle) => void
}) {
  const [section, setSection] = useState("Général")
  const [countries, setCountries] = useState(fallbackCountries)
  const sections = [
    ["Général", <Gear />],
    ["Apparence du menu", <Palette />],
    ["Archives", <Archive />],
  ] as const
  useEffect(() => {
    fetch("https://restcountries.com/v3.1/all?fields=name,currencies,cca2")
      .then((response) => response.json())
      .then((data) =>
        setCountries(
          data
            .map(
              (item: {
                name: { common: string }
                cca2: string
                currencies?: Record<string, { symbol?: string }>
              }) => {
                const code = Object.keys(item.currencies || {})[0] || ""
                return {
                  name: item.name.common,
                  code: item.cca2,
                  currency: code,
                  symbol: item.currencies?.[code]?.symbol || code,
                }
              },
            )
            .sort((a: { name: string }, b: { name: string }) =>
              a.name.localeCompare(b.name),
            ),
        ),
      )
      .catch(() => undefined)
  }, [])
  const grouped = orders.reduce<Record<string, Order[]>>(
    (groups, order) => ({
      ...groups,
      [order.date]: [...(groups[order.date] || []), order],
    }),
    {},
  )
  const selectCountry = (code: string) => {
    const selected = countries.find((item) => item.code === code)
    setCountry(code)
    if (selected) setCurrency(selected.symbol || selected.currency)
  }
  return (
    <main className="page">
      <Title eyebrow="Espace de configuration">Paramètres</Title>
      <div className="settings-layout">
        <aside className="settings-nav">
          {sections.map(([name, icon]) => (
            <button
              key={name}
              className={section === name ? "active" : ""}
              onClick={() => setSection(name)}
            >
              {icon}
              <span>{name}</span>
              <CaretRight />
            </button>
          ))}
        </aside>
        <section className="settings-panel">
          {section === "Général" && (
            <div className="settings-sections">
              <section>
                <div className="panel-heading">
                  <div>
                    <h2>Informations du restaurant</h2>
                    <p>Informations visibles sur votre menu public.</p>
                  </div>
                  <Button>Enregistrer</Button>
                </div>
                <div className="logo-row">
                  <span className="restaurant-logo">MN</span>
                  <div>
                    <b>Logo du restaurant</b>
                    <small>PNG ou JPG, format carré recommandé.</small>
                    <Button variant="secondary">Changer le logo</Button>
                  </div>
                </div>
                <div className="settings-form">
                  <Field label="Nom du restaurant" value="Maison Naya" />
                  <Field label="Téléphone" value="+237 6 99 00 00 00" />
                  <label className="field field-full">
                    <span>Description</span>
                    <textarea defaultValue="Une cuisine généreuse et contemporaine, inspirée des saveurs du Cameroun." />
                  </label>
                  <label className="field">
                    <span>Pays</span>
                    <select
                      value={country}
                      onChange={(event) => selectCountry(event.target.value)}
                    >
                      {countries.map((item) => (
                        <option value={item.code} key={item.code}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <Field label="Ville" value="Yaoundé" />
                  <Field label="Devise appliquée" value={currency} />
                </div>
              </section>
              <section>
                <div className="panel-heading">
                  <div>
                    <h2>Profil</h2>
                    <p>Vos informations personnelles et de contact.</p>
                  </div>
                  <Button>Enregistrer</Button>
                </div>
                <div className="logo-row">
                  <span className="profile-photo">AN</span>
                  <div>
                    <b>Photo de profil</b>
                    <small>JPG ou PNG, 3 Mo maximum.</small>
                    <Button variant="secondary">Changer la photo</Button>
                  </div>
                </div>
                <div className="settings-form">
                  <Field label="Prénom" value="Aïcha" />
                  <Field label="Nom" value="Ndom" />
                  <Field label="Adresse e-mail" value="aicha@maisonnaya.cm" />
                  <Field label="Téléphone" value="+237 6 99 00 00 00" />
                  <label className="field">
                    <span>Langue</span>
                    <select>
                      <option>Français</option>
                      <option>Anglais</option>
                    </select>
                  </label>
                </div>
              </section>
              <section>
                <div className="panel-heading">
                  <div>
                    <h2>Sécurité</h2>
                    <p>Modifiez le mot de passe de votre compte.</p>
                  </div>
                  <Button>Enregistrer</Button>
                </div>
                <div className="settings-form security-form">
                  <Field
                    type="password"
                    label="Ancien mot de passe"
                    placeholder="••••••••"
                  />
                  <Field
                    type="password"
                    label="Nouveau mot de passe"
                    placeholder="8 caractères minimum"
                  />
                  <Field
                    type="password"
                    label="Confirmer le nouveau mot de passe"
                    placeholder="••••••••"
                  />
                </div>
              </section>
            </div>
          )}
          {section === "Apparence du menu" && (
            <div className="appearance-settings">
              <div className="panel-heading">
                <div>
                  <h2>Apparence du menu public</h2>
                  <p>
                    Ces réglages s’appliquent uniquement à votre boutique
                    publique.
                  </p>
                </div>
                <div className="heading-actions">
                  <Button
                    variant="secondary"
                    onClick={() =>
                      setPublicStyle({
                        font: "DM Serif Display",
                        color: "#1e3a32",
                        rounded: true,
                        banner: photos.table,
                      })
                    }
                  >
                    Paramètres par défaut
                  </Button>
                  <Button>Publier les modifications</Button>
                </div>
              </div>
              <label className="banner-upload">
                <img src={publicStyle.banner} alt="" />
                <span>
                  <UploadSimple />
                  <b>Changer la bannière</b>
                  <small>Image horizontale, 1600 × 900 recommandé</small>
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) =>
                    event.target.files?.[0] &&
                    setPublicStyle({
                      ...publicStyle,
                      banner: URL.createObjectURL(event.target.files[0]),
                    })
                  }
                />
              </label>
              <div className="appearance-grid">
                <div>
                  <span className="setting-label">Police d’écriture</span>
                  <div className="font-options">
                    {["DM Serif Display", "System", "Manrope", "Georgia"].map(
                      (font) => (
                        <button
                          key={font}
                          className={
                            publicStyle.font === font ? "selected" : ""
                          }
                          style={{
                            fontFamily:
                              font === "System" ? "-apple-system" : font,
                          }}
                          onClick={() =>
                            setPublicStyle({ ...publicStyle, font })
                          }
                        >
                          Aa<small>{font}</small>
                        </button>
                      ),
                    )}
                  </div>
                </div>
                <div>
                  <span className="setting-label">Couleur principale</span>
                  <div className="color-picker">
                    <input
                      type="color"
                      value={publicStyle.color}
                      onChange={(event) =>
                        setPublicStyle({
                          ...publicStyle,
                          color: event.target.value,
                        })
                      }
                    />
                    <code>{publicStyle.color.toUpperCase()}</code>
                  </div>
                </div>
                <div>
                  <span className="setting-label">Forme des bordures</span>
                  <div className="segmented shape-choice">
                    <button
                      className={publicStyle.rounded ? "active" : ""}
                      onClick={() =>
                        setPublicStyle({ ...publicStyle, rounded: true })
                      }
                    >
                      Arrondies
                    </button>
                    <button
                      className={!publicStyle.rounded ? "active" : ""}
                      onClick={() =>
                        setPublicStyle({ ...publicStyle, rounded: false })
                      }
                    >
                      Carrées
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {section === "Archives" && (
            <div>
              <div className="panel-heading">
                <div>
                  <h2>Archives des commandes</h2>
                  <p>
                    Toutes les commandes depuis la création du compte, de la
                    plus récente à la plus ancienne.
                  </p>
                </div>
                <Button variant="secondary" icon={<DownloadSimple />}>
                  Exporter
                </Button>
              </div>
              <div className="archives">
                {Object.entries(grouped).map(([date, dateOrders]) => (
                  <section key={date}>
                    <h3>{date}</h3>
                    <div>
                      {dateOrders.map((order) => (
                        <article key={order.id}>
                          <span>
                            <b>{order.id}</b>
                            <small>
                              {order.time} · Table {order.table}
                            </small>
                          </span>
                          <span className="archive-items">{order.items}</span>
                          <strong>{money(order.total, currency)}</strong>
                          <Badge status={order.status} />
                        </article>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

function PublicMenu({
  goBack,
  dishes,
  currency,
  publicStyle,
  onCreateOrder,
}: {
  goBack: () => void
  dishes: Dish[]
  currency: string
  publicStyle: PublicStyle
  onCreateOrder: (order: Omit<Order, "id">) => void
}) {
  const [quantities, setQuantities] = useState(dishes.map(() => 0))
  const [cart, setCart] = useState(false)
  const [tableModal, setTableModal] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [note, setNote] = useState("")
  const [tableNumber, setTableNumber] = useState("")
  const count = quantities.reduce((sum, quantity) => sum + quantity, 0)
  const total = quantities.reduce(
    (sum, quantity, index) => sum + quantity * dishes[index].price,
    0,
  )
  const publicVars = {
    "--shop-color": publicStyle.color,
    "--shop-radius": publicStyle.rounded ? "20px" : "2px",
    "--shop-font":
      publicStyle.font === "System"
        ? "-apple-system, BlinkMacSystemFont, sans-serif"
        : publicStyle.font,
  } as React.CSSProperties
  if (confirmed)
    return (
      <div className="public-shell" style={publicVars}>
        <div className="confirmation-page">
          <span className="success-ring">
            <Check />
          </span>
          <span className="eyebrow">COMMANDE ENVOYÉE</span>
          <h1>Merci, votre commande sera bientôt prête.</h1>
          <p>
            Commande <b>R-6</b> pour la table <b>{tableNumber}</b>. L’équipe de
            Maison Naya vous tiendra informé.
          </p>
          <div className="confirmation-summary">
            <span>
              <small>Montant</small>
              <b>{money(total, currency)}</b>
            </span>
            <span>
              <small>Articles</small>
              <b>{count}</b>
            </span>
          </div>
          <Button
            variant="secondary"
            onClick={() => {
              setConfirmed(false)
              setQuantities(dishes.map(() => 0))
            }}
          >
            Retour au menu
          </Button>
        </div>
      </div>
    )
  return (
    <div className="public-shell" style={publicVars}>
      <header className="public-preview-bar">
        <Button variant="ghost" icon={<ArrowLeft />} onClick={goBack}>
          Retour à l’espace pro
        </Button>
        <span>
          <Eye /> Aperçu du menu public
        </span>
        <Button variant="secondary">Copier le lien</Button>
      </header>
      <main className="public-menu">
        <section className="public-hero">
          <img src={publicStyle.banner} alt="Table dressée de Maison Naya" />
          <div className="hero-overlay">
            <div className="public-logo">MN</div>
            <span className="open-pill">
              <i /> OUVERT
            </span>
            <h1>Maison Naya</h1>
            <p>
              Une cuisine généreuse et contemporaine, inspirée des saveurs du
              Cameroun.
            </p>
            <small>Yaoundé · Service jusqu’à 23h</small>
          </div>
        </section>
        <section className="public-content">
          <div className="public-search">
            <MagnifyingGlass />
            <input placeholder="Rechercher un plat…" />
          </div>
          <div className="category-chips">
            {[
              "Tout",
              "Entrées",
              "Plats",
              "Grillades",
              "Desserts",
              "Boissons",
            ].map((chip, index) => (
              <button className={index === 0 ? "active" : ""} key={chip}>
                {chip}
              </button>
            ))}
          </div>
          <div className="public-section-heading">
            <div>
              <span className="eyebrow">NOTRE SÉLECTION</span>
              <h2>Les incontournables</h2>
            </div>
            <span>{dishes.length} plats</span>
          </div>
          <div className="public-dishes">
            {dishes.map((dish, index) => (
              <article
                className={`public-dish ${!dish.available ? "sold-out" : ""}`}
                key={dish.name}
              >
                <div className="public-dish-img">
                  <img src={dish.image} alt={dish.name} />
                  {!dish.available && <span>Épuisé</span>}
                </div>
                <div className="public-dish-copy">
                  <span className="eyebrow">{dish.category}</span>
                  <h3>{dish.name}</h3>
                  <p>{dish.description}</p>
                  <div>
                    <strong>{money(dish.price, currency)}</strong>
                    {dish.available &&
                      (quantities[index] === 0 ? (
                        <Button
                          variant="secondary"
                          icon={<Plus />}
                          onClick={() =>
                            setQuantities(
                              quantities.map((quantity, i) =>
                                i === index ? 1 : quantity,
                              ),
                            )
                          }
                        >
                          Ajouter
                        </Button>
                      ) : (
                        <QuantityControl
                          value={quantities[index]}
                          onChange={(value) =>
                            setQuantities(
                              quantities.map((quantity, i) =>
                                i === index ? value : quantity,
                              ),
                            )
                          }
                        />
                      ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      {count > 0 && (
        <button className="floating-cart" onClick={() => setCart(true)}>
          <span>
            <ForkKnife />
            <em>{count}</em>
          </span>
          <b>Voir ma commande</b>
          <strong>{money(total, currency)}</strong>
        </button>
      )}
      {cart && (
        <div className="drawer-layer" onMouseDown={() => setCart(false)}>
          <aside
            className="cart-drawer"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="drawer-header">
              <div>
                <span className="eyebrow">VOTRE SÉLECTION</span>
                <h2>Ma commande</h2>
              </div>
              <IconButton label="Fermer" onClick={() => setCart(false)}>
                <X />
              </IconButton>
            </div>
            {dishes.map(
              (dish, index) =>
                quantities[index] > 0 && (
                  <div className="cart-item" key={dish.name}>
                    <img src={dish.image} alt="" />
                    <span>
                      <b>{dish.name}</b>
                      <small>{money(dish.price, currency)}</small>
                    </span>
                    <QuantityControl
                      value={quantities[index]}
                      onChange={(value) =>
                        setQuantities(
                          quantities.map((quantity, i) =>
                            i === index ? value : quantity,
                          ),
                        )
                      }
                    />
                  </div>
                ),
            )}
            <div className="cart-total">
              <span>Total provisoire</span>
              <strong>{money(total, currency)}</strong>
            </div>
            <label className="field client-note">
              <span>
                Note client <em>Facultatif</em>
              </span>
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Ex. Sans piment, sauce à part…"
              />
            </label>
            <p className="cart-note">
              Le paiement s’effectue directement auprès du restaurant.
            </p>
            <Button
              className="full-button"
              onClick={() => {
                setCart(false)
                setTableModal(true)
              }}
            >
              Continuer
            </Button>
          </aside>
        </div>
      )}
      {tableModal && (
        <Modal onClose={() => setTableModal(false)}>
          <div className="table-icon">
            <ForkKnife />
          </div>
          <h2>Quel est votre numéro de table ?</h2>
          <p className="modal-copy">
            Saisissez le numéro indiqué sur votre table pour que l’équipe puisse
            vous retrouver.
          </p>
          <Field
            label="Numéro de table"
            placeholder="Ex. T1, VIP-2, Terrasse 4"
            value={tableNumber}
            onChange={setTableNumber}
          />
          <p className="field-help">Le numéro est obligatoire avant l’envoi.</p>
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setTableModal(false)}>
              Retour
            </Button>
            <Button
              disabled={!tableNumber.trim()}
              onClick={() => {
                const items = dishes
                  .map((dish, index) =>
                    quantities[index]
                      ? `${quantities[index]} × ${dish.name}`
                      : "",
                  )
                  .filter(Boolean)
                  .join(", ")
                onCreateOrder({
                  table: tableNumber,
                  time: "À l’instant",
                  items,
                  total,
                  status: "En attente",
                  note,
                  date: "Aujourd’hui · 18 juin 2026",
                })
                setTableModal(false)
                setConfirmed(true)
              }}
            >
              Confirmer la commande
            </Button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function AuthScreen({
  mode,
  setMode,
  onLogin,
}: {
  mode: "login" | "signup" | "onboarding"
  setMode: (mode: "login" | "signup" | "onboarding") => void
  onLogin: () => void
}) {
  const [step, setStep] = useState(1)
  if (mode === "onboarding")
    return (
      <div className="auth-shell">
        <section className="auth-visual">
          <img src={photos.table} alt="" />
          <div>
            <Logo />
            <h1>
              Votre restaurant,
              <br />
              simplement maîtrisé.
            </h1>
            <p>Menu, commandes et performances dans une seule expérience.</p>
          </div>
        </section>
        <section className="auth-form">
          <div className="auth-card onboarding-card">
            <span className="eyebrow">CONFIGURATION · ÉTAPE {step}/2</span>
            <h2>
              {step === 1
                ? "Parlez-nous de vous"
                : "Configurez votre restaurant"}
            </h2>
            <p>Ces informations pourront être modifiées dans les paramètres.</p>
            {step === 1 ? (
              <div className="settings-form">
                <Field label="Prénom" placeholder="Aïcha" />
                <Field label="Nom" placeholder="Ndom" />
                <Field label="Téléphone" placeholder="+237…" />
                <label className="field">
                  <span>Langue</span>
                  <select>
                    <option>Français</option>
                    <option>Anglais</option>
                  </select>
                </label>
              </div>
            ) : (
              <div className="settings-form">
                <Field label="Nom du restaurant" placeholder="Maison Naya" />
                <Field label="Téléphone" placeholder="+237…" />
                <Field label="Ville" placeholder="Yaoundé" />
                <Field label="Devise" value="FCFA" />
                <label className="field field-full">
                  <span>Description</span>
                  <textarea placeholder="Décrivez votre cuisine…" />
                </label>
              </div>
            )}
            <div className="modal-actions">
              {step === 2 && (
                <Button variant="secondary" onClick={() => setStep(1)}>
                  Retour
                </Button>
              )}
              <Button onClick={() => (step === 1 ? setStep(2) : onLogin())}>
                {step === 1 ? "Continuer" : "Terminer la configuration"}
              </Button>
            </div>
          </div>
        </section>
      </div>
    )
  const signup = mode === "signup"
  return (
    <div className="auth-shell">
      <section className="auth-visual">
        <img src={photos.chicken} alt="" />
        <div>
          <Logo />
          <h1>
            {signup
              ? "Créez une expérience à votre image."
              : "Le service commence ici."}
          </h1>
          <p>Un espace calme et précis pour piloter chaque service.</p>
        </div>
      </section>
      <section className="auth-form">
        <div className="auth-card">
          <Logo />
          <span className="eyebrow">
            {signup ? "CRÉER UN COMPTE" : "BON RETOUR PARMI NOUS"}
          </span>
          <h2>
            {signup ? "Commencez avec Restio" : "Connectez-vous à Restio"}
          </h2>
          <div className="social-row">
            <Button variant="secondary" icon={<AppleLogo weight="fill" />}>
              Apple
            </Button>
            <Button variant="secondary" icon={<GoogleLogo />}>
              Google
            </Button>
          </div>
          <div className="auth-separator">
            <span>ou avec votre e-mail</span>
          </div>
          <div className="form-stack">
            <Field label="Adresse e-mail" placeholder="vous@restaurant.com" />
            <Field
              type="password"
              label="Mot de passe"
              placeholder="8 caractères minimum"
            />
          </div>
          <Button
            className="full-button auth-submit"
            onClick={() => (signup ? setMode("onboarding") : onLogin())}
          >
            {signup ? "Créer le compte" : "Se connecter"}
          </Button>
          <p className="auth-switch">
            {signup ? "Vous avez déjà un compte ?" : "Nouveau sur Restio ?"}{" "}
            <button onClick={() => setMode(signup ? "login" : "signup")}>
              {signup ? "Se connecter" : "Créer un compte"}
            </button>
          </p>
          <div className="legal-links">
            <button>Conditions d’utilisation</button>
            <span>·</span>
            <button>Politique de confidentialité</button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default function App() {
  const [authenticated, setAuthenticated] = useState(true)
  const [authMode, setAuthMode] = useState<"login" | "signup" | "onboarding">(
    "login",
  )
  const [view, setView] = useState<View>("orders")
  const [dishes, setDishes] = useState(initialDishes)
  const [orders, setOrders] = useState(initialOrders)
  const [country, setCountry] = useState("CM")
  const [currency, setCurrency] = useState("FCFA")
  const [publicStyle, setPublicStyle] = useState<PublicStyle>({
    font: "DM Serif Display",
    color: "#1e3a32",
    rounded: true,
    banner: photos.table,
  })
  if (!authenticated)
    return (
      <AuthScreen
        mode={authMode}
        setMode={setAuthMode}
        onLogin={() => {
          setAuthenticated(true)
          setView("orders")
        }}
      />
    )
  if (view === "public")
    return (
      <PublicMenu
        goBack={() => setView("menu")}
        dishes={dishes}
        currency={currency}
        publicStyle={publicStyle}
        onCreateOrder={(order) =>
          setOrders([...orders, { ...order, id: `R-${orders.length + 1}` }])
        }
      />
    )
  return (
    <div className="app-shell">
      <Sidebar
        view={view}
        setView={setView}
        onLogout={() => {
          setAuthenticated(false)
          setAuthMode("login")
        }}
      />
      <div className="main-shell">
        <Header openPublic={() => setView("public")} />
        {view === "orders" && (
          <OrdersPage
            orders={orders}
            setOrders={setOrders}
            dishes={dishes}
            currency={currency}
          />
        )}
        {view === "menu" && (
          <MenuPage dishes={dishes} setDishes={setDishes} currency={currency} />
        )}
        {view === "qr" && <QRPage />}
        {view === "stats" && <StatsPage dishes={dishes} currency={currency} />}
        {view === "settings" && (
          <SettingsPage
            orders={orders}
            currency={currency}
            country={country}
            setCountry={setCountry}
            setCurrency={setCurrency}
            publicStyle={publicStyle}
            setPublicStyle={setPublicStyle}
          />
        )}
      </div>
      <nav className="mobile-nav premium-mobile-nav">
        <button
          className={view === "orders" ? "active" : ""}
          onClick={() => setView("orders")}
        >
          <SquaresFour />
          <span>Commandes</span>
        </button>
        <button
          className={view === "menu" ? "active" : ""}
          onClick={() => setView("menu")}
        >
          <ForkKnife />
          <span>Menu</span>
        </button>
        <button
          className={`qr-nav-button ${view === "qr" ? "active" : ""}`}
          onClick={() => setView("qr")}
        >
          <QrCode />
          <span>QR code</span>
        </button>
        <button
          className={view === "stats" ? "active" : ""}
          onClick={() => setView("stats")}
        >
          <ChartBar />
          <span>Stats</span>
        </button>
        <button
          className={view === "settings" ? "active" : ""}
          onClick={() => setView("settings")}
        >
          <Gear />
          <span>Réglages</span>
        </button>
      </nav>
    </div>
  )
}
