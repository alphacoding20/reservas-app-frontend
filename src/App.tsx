import { useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Activity, AlertCircle, ArrowRight, Bell, CalendarDays, CalendarCheck, Check, ChevronRight, CloudRain, LayoutDashboard, LogOut, MapPin, Menu, Plus, Search, Settings, ShieldCheck, SlidersHorizontal, Trophy, Users, Wallet, X, RefreshCw, Trash2, Clock3 } from "lucide-react";
import { useAuth } from "./auth";
import { apiError, authService, courtService, money, notificationService, reservationService } from "./api";
import type { Availability, Court, NotificationItem, Reservation, ReservationStats, Tariff, WeatherForecast } from "./types";

function Protected({children,admin=false}:{children:React.ReactNode;admin?:boolean}) {
  const {user}=useAuth();
  if(!user) return <Navigate to="/login" replace/>;
  if(admin && user.rol!=="ADMIN") return <Navigate to="/app" replace/>;
  return <>{children}</>;
}
export default function App(){
  return <Routes>
    <Route path="/login" element={<AuthPage/>}/>
    <Route path="/" element={<Navigate to="/app" replace/>}/>
    <Route path="/app" element={<Protected><Shell><Dashboard/></Shell></Protected>}/>
    <Route path="/app/canchas" element={<Protected><Shell><CourtsPage/></Shell></Protected>}/>
    <Route path="/app/reservas" element={<Protected><Shell><ReservationsPage/></Shell></Protected>}/>
    <Route path="/app/notificaciones" element={<Protected><Shell><NotificationsPage/></Shell></Protected>}/>
    <Route path="/admin" element={<Protected admin><Shell><AdminDashboard/></Shell></Protected>}/>
    <Route path="/admin/canchas" element={<Protected admin><Shell><AdminCourts/></Shell></Protected>}/>
    <Route path="/admin/reservas" element={<Protected admin><Shell><ReservationsPage/></Shell></Protected>}/>
    <Route path="/admin/notificaciones" element={<Protected admin><Shell><NotificationsPage/></Shell></Protected>}/>
    <Route path="/admin/operacion" element={<Protected admin><Shell><AdminOperations/></Shell></Protected>}/>
    <Route path="*" element={<Navigate to="/" replace/>}/>
  </Routes>;
}
function Brand({inverse=false}:{inverse?:boolean}) {
  return <Link to="/" className={`inline-flex items-center gap-3 text-xl font-bold ${inverse?"text-white":"text-slate-900"}`}><span className={`grid h-10 w-10 place-items-center rounded-xl ${inverse?"bg-white text-blue-700":"bg-blue-600 text-white"}`}><Trophy size={21}/></span>CanchaYa<span className={`text-[10px] font-semibold tracking-widest ${inverse?"text-blue-200":"text-blue-600"}`}>SPORTS</span></Link>;
}
function AuthPage(){
  const {user,login,register}=useAuth(); const nav=useNavigate();
  const [mode,setMode]=useState<"login"|"register">("login"); const [busy,setBusy]=useState(false); const [error,setError]=useState("");
  const [f,setF]=useState({nombre:"",correo:"",clave:"",edad:"18",numeroTelefonico:"",telegramChatId:""});
  useEffect(()=>{if(user)nav(user.rol==="ADMIN"?"/admin":"/app")},[user,nav]);
  const change=(k:keyof typeof f,v:string)=>setF(p=>({...p,[k]:v}));
  async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);setError("");try{
    if(mode==="login") await login(f.correo,f.clave);
    else {const result=await authService.register({nombre:f.nombre,correo:f.correo,clave:f.clave,edad:Number(f.edad),numeroTelefonico:f.numeroTelefonico,...(f.telegramChatId?{telegramChatId:f.telegramChatId}:{})});if(result?.id){localStorage.setItem("reservas_session",JSON.stringify(result));window.location.assign(result.rol==="ADMIN"?"/admin":"/app")}else await login(f.correo,f.clave);}
  }catch(e){setError(apiError(e))}finally{setBusy(false)}}
  return <div className="min-h-screen bg-white"><div className="grid min-h-screen lg:grid-cols-[1.05fr_.95fr]">
    <section className="relative hidden overflow-hidden bg-blue-700 p-12 text-white lg:flex lg:flex-col lg:justify-between"><div className="absolute -right-24 -top-24 h-96 w-96 rounded-full border-[50px] border-white/10"/><Brand inverse/><div className="relative z-10 max-w-xl"><span className="rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold">TU PRÓXIMO PARTIDO EMPIEZA AQUÍ</span><h1 className="mt-8 text-5xl font-bold leading-tight">Encuentra tu cancha. Reserva tu momento.</h1><p className="mt-5 max-w-md leading-7 text-blue-100">Consulta disponibilidad, elige tu horario y organiza tu próximo encuentro deportivo desde un solo lugar.</p><div className="mt-10 flex gap-10 text-sm text-blue-100"><div><b className="block text-2xl text-white">4</b>Servicios integrados</div><div><b className="block text-2xl text-white">24/7</b>Consulta en línea</div></div></div><p className="text-xs text-blue-200">CanchaYa · Reservas deportivas</p></section>
    <section className="flex items-center justify-center px-6 py-12"><div className="w-full max-w-md"><div className="mb-10 lg:hidden"><Brand/></div><p className="text-xs font-bold tracking-widest text-blue-600">BIENVENIDO A CANCHAYA</p><h2 className="mt-2 text-3xl font-bold text-slate-900">{mode==="login"?"Inicia sesión":"Crea tu cuenta"}</h2><p className="mt-2 text-sm text-slate-500">{mode==="login"?"Ingresa tus datos para continuar.":"Regístrate para comenzar a reservar."}</p>
      <div className="mt-7 grid grid-cols-2 rounded-xl bg-slate-100 p-1"><button onClick={()=>{setMode("login");setError("")}} className={`rounded-lg py-2.5 text-sm font-semibold ${mode==="login"?"bg-white text-slate-900 shadow-sm":"text-slate-500"}`}>Iniciar sesión</button><button onClick={()=>{setMode("register");setError("")}} className={`rounded-lg py-2.5 text-sm font-semibold ${mode==="register"?"bg-white text-slate-900 shadow-sm":"text-slate-500"}`}>Registrarme</button></div>
      <form onSubmit={submit} className="mt-6 space-y-4">{mode==="register"&&<Field label="Nombre completo" value={f.nombre} onChange={v=>change("nombre",v)} required/>}<Field label="Correo electrónico" type="email" value={f.correo} onChange={v=>change("correo",v)} required/><Field label="Contraseña" type="password" value={f.clave} onChange={v=>change("clave",v)} required/>{mode==="register"&&<><div className="grid grid-cols-2 gap-3"><Field label="Edad" type="number" value={f.edad} onChange={v=>change("edad",v)} required/><Field label="Teléfono" value={f.numeroTelefonico} onChange={v=>change("numeroTelefonico",v)} required/></div><Field label="Telegram Chat ID (opcional)" value={f.telegramChatId} onChange={v=>change("telegramChatId",v)}/></>}{error&&<ErrorBox message={error}/>}<button disabled={busy} className="btn-primary w-full py-3.5">{busy?"Procesando...":mode==="login"?"Entrar a mi cuenta":"Crear cuenta"}<ArrowRight size={16}/></button></form><p className="mt-8 text-center text-xs text-slate-400">CanchaYa · Plataforma de reservas deportivas</p></div></section>
  </div></div>;
}
function Shell({children}:{children:React.ReactNode}){
  const {user,logout}=useAuth(); const loc=useLocation(); const [open,setOpen]=useState(false); const admin=user?.rol==="ADMIN";
  const links=admin?[["/admin","Resumen",LayoutDashboard],["/admin/canchas","Canchas",Trophy],["/admin/operacion","Operaciones",Settings],["/admin/reservas","Reservas",CalendarDays],["/admin/notificaciones","Notificaciones",Bell]] as const:[["/app","Inicio",LayoutDashboard],["/app/canchas","Explorar canchas",Trophy],["/app/reservas","Mis reservas",CalendarDays],["/app/notificaciones","Notificaciones",Bell]] as const;
  return <div className="min-h-screen bg-slate-50">{open&&<button onClick={()=>setOpen(false)} className="fixed inset-0 z-30 bg-slate-900/30 lg:hidden"/>}<aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform lg:translate-x-0 ${open?"translate-x-0":"-translate-x-full"}`}><div className="flex h-20 items-center border-b border-slate-100 px-6"><Brand/></div><div className="px-4 pt-7"><p className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">{admin?"Administración":"Mi espacio"}</p><nav className="mt-3 space-y-1">{links.map(([to,label,Icon])=><Link key={to} to={to} onClick={()=>setOpen(false)} className={`nav-link ${loc.pathname===to?"nav-link-active":""}`}><Icon size={18}/>{label}</Link>)}</nav></div><div className="mt-auto p-4"><div className="rounded-2xl bg-blue-50 p-4"><p className="flex items-center gap-2 text-sm font-semibold text-blue-900"><ShieldCheck size={16}/>Tu espacio deportivo</p><p className="mt-1 text-xs leading-5 text-blue-700">Gestiona tus reservas y consulta la información de tus canchas.</p></div><button onClick={logout} className="mt-4 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-500 hover:bg-slate-100"><LogOut size={18}/>Cerrar sesión</button></div></aside>
    <div className="lg:pl-64"><header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-200 bg-white/90 px-5 backdrop-blur md:px-8"><div className="flex items-center gap-3"><button onClick={()=>setOpen(true)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"><Menu size={21}/></button><div><p className="text-xs text-slate-400">Plataforma deportiva</p><p className="text-sm font-semibold text-slate-800">{admin?"Panel de administración":"Área de usuario"}</p></div></div><div className="flex items-center gap-3"><div className="hidden text-right sm:block"><p className="text-sm font-semibold text-slate-800">{user?.nombre}</p><p className="text-xs text-slate-400">{admin?"Administrador":"Deportista"}</p></div><div className="grid h-10 w-10 place-items-center rounded-full bg-blue-100 font-bold text-blue-700">{user?.nombre?.slice(0,1).toUpperCase()}</div></div></header><main className="mx-auto max-w-[1500px] p-5 md:p-8">{children}</main></div>
  </div>;
}
function PageTitle({title,desc,eyebrow,action}:{title:string;desc?:string;eyebrow?:string;action?:React.ReactNode}){
  return <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div>{eyebrow&&<p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-600">{eyebrow}</p>}<h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">{title}</h1>{desc&&<p className="mt-2 text-sm text-slate-500">{desc}</p>}</div>{action}</div>;
}
function Dashboard(){
  const {user}=useAuth(); const [courts,setCourts]=useState<Court[]>([]); const [reservations,setReservations]=useState<Reservation[]>([]); const [error,setError]=useState("");
  useEffect(()=>{Promise.all([courtService.list(),reservationService.history(user!.id)]).then(([c,r])=>{setCourts(c);setReservations(r)}).catch(e=>setError(apiError(e)))},[user]);
  const upcoming=reservations.filter(r=>r.estado==="CONFIRMADA").slice(0,3);
  return <><div className="mb-8 rounded-3xl bg-gradient-to-r from-blue-700 to-blue-500 p-7 text-white shadow-soft md:p-10"><p className="text-sm font-semibold text-blue-100">HOLA, {user?.nombre?.split(" ")[0]?.toUpperCase()}</p><h1 className="mt-3 max-w-2xl text-3xl font-bold leading-tight md:text-4xl">Tu próximo partido está a un clic.</h1><p className="mt-3 max-w-xl text-sm leading-6 text-blue-100">Encuentra espacios deportivos, revisa horarios y reserva el momento perfecto para jugar.</p><Link to="/app/canchas" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-blue-700 hover:bg-blue-50">Explorar canchas<ArrowRight size={16}/></Link></div>
    {error&&<ErrorBox message={error}/>}<div className="grid gap-4 sm:grid-cols-3"><Stat label="Canchas activas" value={String(courts.filter(c=>c.estado==="ACTIVA").length)} icon={<Trophy/>}/><Stat label="Mis reservas" value={String(reservations.length)} icon={<CalendarCheck/>} tone="green"/><Stat label="Por jugar" value={String(reservations.filter(r=>r.estado==="CONFIRMADA").length)} icon={<Clock3/>} tone="violet"/></div>
    <section className="mt-9"><div className="mb-4 flex items-center justify-between"><div><h2 className="font-bold text-slate-900">Próximas reservas</h2><p className="mt-1 text-sm text-slate-500">Tus encuentros confirmados.</p></div><Link to="/app/reservas" className="text-sm font-semibold text-blue-600">Ver todas</Link></div>{upcoming.length?<div className="grid gap-4 md:grid-cols-3">{upcoming.map(r=><div className="card" key={r.id}><Status value={r.estado}/><p className="mt-4 font-bold">Reserva #{r.id}</p><p className="mt-1 text-sm text-slate-500">{fmtDate(r.fecha)} · {r.horaInicio}–{r.horaFin}</p><p className="mt-3 font-bold">{money(r.precioTotal)}</p></div>)}</div>:<Empty title="Todavía no tienes reservas" text="Explora las canchas y encuentra un horario para jugar." action={<Link className="btn-primary" to="/app/canchas">Buscar canchas</Link>}/>}</section>
    <section className="mt-9"><div className="mb-4 flex items-center justify-between"><div><h2 className="font-bold text-slate-900">Canchas disponibles</h2><p className="mt-1 text-sm text-slate-500">Opciones activas en la plataforma.</p></div><Link to="/app/canchas" className="text-sm font-semibold text-blue-600">Explorar todas</Link></div><div className="grid gap-4 md:grid-cols-3">{courts.filter(c=>c.estado==="ACTIVA").slice(0,3).map(c=><CourtCard key={c.id} court={c} onSelect={()=>window.location.assign("/app/canchas")}/>)}</div></section>
  </>;
}
function Stat({label,value,icon,tone="blue"}:{label:string;value:string;icon:React.ReactNode;tone?:string}){
  const colors:Record<string,string>={blue:"bg-blue-50 text-blue-600",green:"bg-emerald-50 text-emerald-600",violet:"bg-violet-50 text-violet-600",amber:"bg-amber-50 text-amber-600"};
  return <div className="card flex items-center gap-4"><div className={`grid h-12 w-12 place-items-center rounded-2xl ${colors[tone]}`}>{icon}</div><div><p className="text-sm text-slate-500">{label}</p><p className="mt-1 text-2xl font-bold text-slate-900">{value}</p></div></div>;
}
function CourtCard({court,onSelect}:{court:Court;onSelect:()=>void}){
  return <div className="card overflow-hidden p-0"><div className="relative flex h-32 items-end bg-gradient-to-br from-blue-100 via-sky-50 to-slate-100 p-5"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-blue-600 shadow-sm"><Trophy size={23}/></div><span className="absolute right-4 top-4 rounded-full bg-white px-3 py-1 text-[10px] font-bold text-emerald-700">{court.estado}</span></div><div className="p-5"><div className="flex items-start justify-between gap-2"><div><h3 className="font-bold text-slate-900">{court.nombre}</h3><p className="mt-1 text-xs font-semibold uppercase text-blue-600">{court.tipoDeporte?.replaceAll("_"," ")}</p></div><span className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] text-slate-600">{court.techada?"Techada":"Abierta"}</span></div><p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500"><MapPin size={13}/>{court.direccion||"Dirección no registrada"}</p><div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4"><div><p className="text-xs text-slate-400">Precio por hora</p><p className="font-bold">{money(court.precioPorHora)}</p></div><button onClick={onSelect} className="btn-primary">Ver horarios<ArrowRight size={14}/></button></div></div></div>;
}
function CourtsPage(){
  const [items,setItems]=useState<Court[]>([]);const [shown,setShown]=useState<Court[]>([]);const [sport,setSport]=useState("");const [roof,setRoof]=useState("");const [loading,setLoading]=useState(true);const [error,setError]=useState("");const [selected,setSelected]=useState<Court|null>(null);
  useEffect(()=>{courtService.list().then(d=>{setItems(d);setShown(d)}).catch(e=>setError(apiError(e))).finally(()=>setLoading(false))},[]);
  async function filter(){setLoading(true);setError("");try{const d=(sport||roof!=="")?await courtService.search({deporte:sport||undefined,techada:roof===""?"":roof==="true"}):items;setShown(d)}catch(e){setError(apiError(e))}finally{setLoading(false)}}
  return <><PageTitle eyebrow="Explorar" title="Encuentra tu cancha" desc="Elige el deporte, consulta horarios y reserva en pocos pasos."/><div className="card mb-6 flex flex-col gap-3 md:flex-row md:items-end"><div className="flex-1"><label className="label">Deporte</label><select className="input" value={sport} onChange={e=>setSport(e.target.value)}><option value="">Todos los deportes</option>{["FUTBOL_5","FUTBOL_8","BALONCESTO","TENIS","PADEL","VOLEIBOL"].map(s=><option key={s}>{s}</option>)}</select></div><div className="flex-1"><label className="label">Tipo de cancha</label><select className="input" value={roof} onChange={e=>setRoof(e.target.value)}><option value="">Todas</option><option value="true">Techada</option><option value="false">A cielo abierto</option></select></div><button onClick={filter} className="btn-primary"><SlidersHorizontal size={16}/>Aplicar filtros</button></div>{error&&<ErrorBox message={error}/>}{loading?<Loading/>:shown.length?<div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{shown.map(c=><CourtCard key={c.id} court={c} onSelect={()=>setSelected(c)}/>)}</div>:<Empty title="No encontramos canchas" text="Prueba cambiando los filtros."/>}{selected&&<BookingModal court={selected} onClose={()=>setSelected(null)}/>}</>;
}
function BookingModal({court,onClose}:{court:Court;onClose:()=>void}){
  const {user}=useAuth();
  const [date,setDate]=useState(new Date().toLocaleDateString("en-CA"));
  const [data,setData]=useState<Availability|null>(null);
  const [tariff,setTariff]=useState<Tariff|null>(null);
  const [slot,setSlot]=useState("");
  const [loading,setLoading]=useState(false);
  const [tariffLoading,setTariffLoading]=useState(false);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [tariffError,setTariffError]=useState("");
  const [done,setDone]=useState(false);
  const [createdReservationId,setCreatedReservationId]=useState<number|null>(null);
  const [createdPrice,setCreatedPrice]=useState<number|null>(null);

  async function load(){
    setLoading(true);
    setTariffLoading(true);
    setError("");
    setTariffError("");
    setSlot("");
    setData(null);
    setTariff(null);

    const [availabilityResult,tariffResult]=await Promise.allSettled([
      reservationService.availability(court.id,date),
      courtService.tariff(court.id,date)
    ]);

    if(availabilityResult.status==="fulfilled"){
      setData(availabilityResult.value);
    }else{
      setError(apiError(availabilityResult.reason));
    }

    if(tariffResult.status==="fulfilled"){
      setTariff(tariffResult.value);
    }else{
      setTariffError(apiError(tariffResult.reason));
    }

    setLoading(false);
    setTariffLoading(false);
  }

  useEffect(()=>{void load()},[court.id,date]);

  async function reserve(){
    if(!slot||!user||!tariff||tariffLoading)return;
    const [horaInicio,horaFin]=slot.split("|");
    setBusy(true);
    setError("");
    try{
      const created=await reservationService.create({
        canchaId:court.id,
        usuarioId:user.id,
        fecha:date,
        horaInicio,
        horaFin
      });
      setCreatedReservationId(created.id);
      setCreatedPrice(created.precioTotal);
      setDone(true);
    }catch(e){
      setError(apiError(e));
    }finally{
      setBusy(false);
    }
  }

  return <Modal title={`Reservar ${court.nombre}`} onClose={onClose}>
    {done ? (
      <div className="py-5 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-emerald-600">
          <Check size={28}/>
        </div>
        <h3 className="mt-4 text-xl font-bold">¡Reserva creada!</h3>
        <p className="mt-2 text-sm text-slate-500">
          Tu reserva quedó confirmada. Valor registrado: <b>{money(createdPrice ?? undefined)}</b>.
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Puedes consultar el pronóstico de lluvia a continuación y también en «Mis reservas».
        </p>
        {createdReservationId!==null&&<WeatherCard reservationId={createdReservationId}/>}
        <button className="btn-primary mt-6" onClick={onClose}>Cerrar</button>
      </div>
    ) : (
      <>
        <div className="mb-4 rounded-xl bg-blue-50 p-4">
          <b className="text-blue-900">{court.tipoDeporte?.replaceAll("_"," ")}</b>
          <p className="mt-1 text-sm text-blue-700">
            Precio base: {money(court.precioPorHora)} por hora · {court.horaApertura}–{court.horaCierre}
          </p>
        </div>

        <label className="label">Fecha de reserva</label>
        <div className="flex gap-2">
          <input
            type="date"
            className="input"
            min={new Date().toLocaleDateString("en-CA")}
            value={date}
            onChange={e=>setDate(e.target.value)}
          />
          <button type="button" onClick={()=>void load()} className="btn-secondary" disabled={loading||tariffLoading}>
            <Search size={15}/>Actualizar
          </button>
        </div>

        {tariffLoading ? (
          <div className="mt-4"><Loading/></div>
        ) : tariff ? (
          <TariffNotice tariff={tariff}/>
        ) : (
          <div className="mt-4">
            <ErrorBox message={tariffError||"No fue posible consultar la tarifa para esta fecha. Actualiza antes de reservar."}/>
          </div>
        )}

        {loading ? (
          <Loading/>
        ) : data ? (
          <>
            <p className="mb-3 mt-5 text-sm font-semibold">Horarios disponibles</p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {data.franjas?.map(s=>(
                <button
                  key={`${s.horaInicio}-${s.horaFin}`}
                  type="button"
                  disabled={!s.disponible}
                  onClick={()=>setSlot(`${s.horaInicio}|${s.horaFin}`)}
                  className={`rounded-xl border px-2 py-3 text-xs font-semibold ${
                    !s.disponible
                      ? "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300 line-through"
                      : slot===`${s.horaInicio}|${s.horaFin}`
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-200 text-slate-700 hover:border-blue-400"
                  }`}
                >
                  {s.horaInicio}–{s.horaFin}
                </button>
              ))}
            </div>
          </>
        ) : null}

        {error&&<div className="mt-4"><ErrorBox message={error}/></div>}

        <button
          disabled={!slot||busy||!tariff||tariffLoading||loading}
          onClick={reserve}
          className="btn-primary mt-6 w-full"
        >
          {busy?"Creando reserva...":"Confirmar reserva"}
          <ArrowRight size={15}/>
        </button>
      </>
    )}
  </Modal>;
}
function ReservationsPage(){
  const {user}=useAuth();
  const isAdmin=user?.rol==="ADMIN";
  const [items,setItems]=useState<Reservation[]>([]);
  const [courts,setCourts]=useState<Court[]>([]);
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(true);
  const [reschedule,setReschedule]=useState<Reservation|null>(null);
  const [statusFilter,setStatusFilter]=useState("TODOS");
  const [courtFilter,setCourtFilter]=useState("TODAS");
  const [dateFrom,setDateFrom]=useState("");
  const [dateTo,setDateTo]=useState("");
  const [search,setSearch]=useState("");

  async function refresh(){
    if(!user)return;
    setLoading(true);
    setError("");
    try{
      const [r,c]=await Promise.all([
        isAdmin?reservationService.all():reservationService.history(user.id),
        courtService.list()
      ]);
      setItems(r);
      setCourts(c);
    }catch(e){
      setError(apiError(e));
    }finally{
      setLoading(false);
    }
  }

  useEffect(()=>{void refresh()},[user]);

  async function cancel(id:number){
    if(!confirm("¿Seguro que deseas cancelar esta reserva?"))return;
    try{
      await reservationService.cancel(id);
      await refresh();
    }catch(e){setError(apiError(e))}
  }

  async function attendance(id:number,state:"COMPLETADA"|"NO_ASISTIO"){
    try{
      await reservationService.markAttendance(id,state);
      await refresh();
    }catch(e){setError(apiError(e))}
  }

  const filtered=items.filter(r=>{
    const matchesStatus=statusFilter==="TODOS"||r.estado===statusFilter;
    const matchesCourt=courtFilter==="TODAS"||String(r.canchaId)===courtFilter;
    const matchesFrom=!dateFrom||r.fecha>=dateFrom;
    const matchesTo=!dateTo||r.fecha<=dateTo;
    const q=search.trim().toLowerCase();
    const matchesSearch=!q||String(r.id).includes(q)||String(r.usuarioId).includes(q);
    return matchesStatus&&matchesCourt&&matchesFrom&&matchesTo&&matchesSearch;
  });

  return <>
    <PageTitle
      eyebrow={isAdmin?"Administración":"Mi actividad"}
      title={isAdmin?"Reservas de la plataforma":"Mis reservas"}
      desc={isAdmin?"Consulta y gestiona las reservas registradas en todas las canchas.":"Consulta, cancela o reprograma tus reservas."}
    />
    {isAdmin&&<div className="card mb-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div><h2 className="font-bold text-slate-900">Filtros de búsqueda</h2><p className="mt-1 text-xs text-slate-500">Filtra la información que ya está registrada, sin modificar las reservas.</p></div>
        <button className="btn-secondary" type="button" onClick={()=>{setStatusFilter("TODOS");setCourtFilter("TODAS");setDateFrom("");setDateTo("");setSearch("")}}>Limpiar filtros</button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <div><label className="label">Estado</label><select className="input" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}><option value="TODOS">Todos</option><option value="CONFIRMADA">Confirmada</option><option value="CANCELADA">Cancelada</option><option value="COMPLETADA">Completada</option><option value="NO_ASISTIO">No asistió</option></select></div>
        <div><label className="label">Cancha</label><select className="input" value={courtFilter} onChange={e=>setCourtFilter(e.target.value)}><option value="TODAS">Todas las canchas</option>{courts.map(c=><option key={c.id} value={String(c.id)}>{c.nombre}</option>)}</select></div>
        <Field label="Desde" type="date" value={dateFrom} onChange={setDateFrom}/>
        <Field label="Hasta" type="date" value={dateTo} onChange={setDateTo}/>
        <Field label="Reserva o usuario #" value={search} onChange={setSearch}/>
      </div>
      <p className="mt-3 text-xs text-slate-500">Mostrando {filtered.length} de {items.length} reservas.</p>
    </div>}
    {error&&<ErrorBox message={error}/>}
    {loading ? <Loading/> : filtered.length ? (
      <div className="space-y-4">
        {filtered.map(r=>(
          <div key={r.id} className="card">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600"><CalendarDays/></div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <b>{courts.find(c=>c.id===r.canchaId)?.nombre||`Cancha #${r.canchaId}`}</b>
                    <Status value={r.estado}/>
                    <span className="text-xs text-slate-400">Reserva #{r.id}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{fmtDate(r.fecha)} · {r.horaInicio}–{r.horaFin}</p>
                  <p className="mt-1 text-sm font-semibold">{money(r.precioTotal)}</p>
                  {isAdmin&&<p className="mt-1 text-xs text-slate-400">Usuario #{r.usuarioId}</p>}
                </div>
              </div>
              {r.estado==="CONFIRMADA"&&(
                <div className="flex flex-wrap gap-2">
                  {isAdmin ? <>
                    <button className="btn-secondary" onClick={()=>attendance(r.id,"COMPLETADA")}>Completar</button>
                    <button className="btn-secondary" onClick={()=>attendance(r.id,"NO_ASISTIO")}>No asistió</button>
                    <button className="btn-danger" onClick={()=>cancel(r.id)}><X size={14}/>Cancelar</button>
                  </> : <>
                    <button className="btn-secondary" onClick={()=>setReschedule(r)}><RefreshCw size={14}/>Reprogramar</button>
                    <button className="btn-danger" onClick={()=>cancel(r.id)}><X size={14}/>Cancelar</button>
                  </>}
                </div>
              )}
            </div>
            {r.estado==="CONFIRMADA"&&<WeatherCard reservationId={r.id}/>}
          </div>
        ))}
      </div>
    ) : (
      <Empty title={isAdmin?"No hay reservas con esos filtros":"Aún no tienes reservas"} text={isAdmin?"Prueba cambiando los criterios de búsqueda.":"Cuando reserves una cancha, aparecerá aquí."} action={!isAdmin?<Link className="btn-primary" to="/app/canchas">Explorar canchas</Link>:undefined}/>
    )}
    {reschedule&&<RescheduleModal item={reschedule} onClose={()=>setReschedule(null)} onDone={()=>{setReschedule(null);void refresh()}}/>}
  </>;
}
function RescheduleModal({item,onClose,onDone}:{item:Reservation;onClose:()=>void;onDone:()=>void}){
  const [fecha,setFecha]=useState(item.fecha);
  const [horaInicio,setStart]=useState(item.horaInicio);
  const [horaFin,setEnd]=useState(item.horaFin);
  const [tariff,setTariff]=useState<Tariff|null>(null);
  const [tariffLoading,setTariffLoading]=useState(false);
  const [tariffError,setTariffError]=useState("");
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);

  useEffect(()=>{
    let active=true;
    setTariff(null);
    setTariffError("");
    setTariffLoading(true);
    courtService.tariff(item.canchaId,fecha)
      .then(value=>{if(active)setTariff(value)})
      .catch(e=>{if(active)setTariffError(apiError(e))})
      .finally(()=>{if(active)setTariffLoading(false)});
    return ()=>{active=false};
  },[item.canchaId,fecha]);

  const horas=Math.max(0,(
    (Number(horaFin.slice(0,2))*60+Number(horaFin.slice(3,5))) -
    (Number(horaInicio.slice(0,2))*60+Number(horaInicio.slice(3,5)))
  )/60);

  async function submit(){
    setBusy(true);
    setError("");
    try{
      await reservationService.reschedule(item.id,{fecha,horaInicio,horaFin});
      onDone();
    }catch(e){setError(apiError(e))}
    finally{setBusy(false)}
  }

  return <Modal title="Reprogramar reserva" onClose={onClose}>
    <Field label="Nueva fecha" type="date" value={fecha} onChange={setFecha}/>
    <div className="mt-4 grid grid-cols-2 gap-3">
      <Field label="Hora de inicio" type="time" value={horaInicio} onChange={setStart}/>
      <Field label="Hora de fin" type="time" value={horaFin} onChange={setEnd}/>
    </div>
    {tariffLoading ? <div className="mt-4"><Loading/></div> : tariff ? (
      <TariffNotice tariff={tariff} estimatedHours={horas}/>
    ) : (
      <div className="mt-4"><ErrorBox message={tariffError||"No fue posible consultar la tarifa de la nueva fecha."}/></div>
    )}
    <p className="mt-3 text-xs text-slate-500">
      El servicio recalcula el valor de la reserva al guardar la nueva fecha y horario.
    </p>
    {error&&<div className="mt-4"><ErrorBox message={error}/></div>}
    <button onClick={submit} disabled={busy||tariffLoading||!tariff||horas<=0} className="btn-primary mt-6 w-full">
      {busy?"Guardando...":"Guardar nueva fecha"}
    </button>
  </Modal>;
}
function NotificationsPage(){
  const {user}=useAuth();const [items,setItems]=useState<NotificationItem[]>([]);const [error,setError]=useState("");const [loading,setLoading]=useState(true);
  useEffect(()=>{notificationService.history(user!.id).then(setItems).catch(e=>setError(apiError(e))).finally(()=>setLoading(false))},[user]);
  return <><PageTitle eyebrow="Mensajes" title="Notificaciones" desc="Historial de mensajes y confirmaciones del sistema."/>{error&&<ErrorBox message={error}/>}{loading?<Loading/>:items.length?<div className="space-y-3">{items.map(n=><div key={n.id} className="card flex gap-4"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600"><Bell size={19}/></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><b>{n.tipo?.replaceAll("_"," ")}</b><Status value={n.estado}/></div><p className="mt-1 text-sm text-slate-600">{n.mensaje}</p><p className="mt-2 text-xs text-slate-400">{n.canal} · {n.fecha?new Date(n.fecha).toLocaleString("es-CO"):"Fecha no disponible"} · Intentos: {n.intentos}</p></div></div>)}</div>:<Empty title="Sin notificaciones" text="Aquí aparecerán las confirmaciones y avisos de tus reservas."/>}</>;
}
function AdminDashboard(){
  const [stats,setStats]=useState<ReservationStats|null>(null);const [courts,setCourts]=useState<Court[]>([]);const [error,setError]=useState("");const today=new Date().toLocaleDateString("en-CA");const from=new Date(Date.now()-30*86400000).toLocaleDateString("en-CA");
  useEffect(()=>{Promise.all([reservationService.stats(from,today),courtService.list()]).then(([s,c])=>{setStats(s);setCourts(c)}).catch(e=>setError(apiError(e)))},[]);
  return <><PageTitle eyebrow="Administración" title="Resumen general" desc="Indicadores de operación y estado de las instalaciones." action={<Link to="/admin/operacion" className="btn-primary"><Settings size={16}/>Acciones operativas</Link>}/>{error&&<ErrorBox message={error}/>}<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Stat label="Reservas del periodo" value={String(stats?.totalReservas??"—")} icon={<CalendarCheck/>}/><Stat label="Canchas registradas" value={String(courts.length)} icon={<Trophy/>} tone="green"/><Stat label="Canchas activas" value={String(courts.filter(c=>c.estado==="ACTIVA").length)} icon={<Activity/>} tone="violet"/><Stat label="Confirmadas" value={String(stats?.porEstado?.CONFIRMADA??"—")} icon={<Users/>} tone="amber"/></div><div className="mt-8 grid gap-5 xl:grid-cols-[1.3fr_.7fr]"><div className="card"><h2 className="font-bold">Reservas por estado</h2><p className="mb-5 mt-1 text-xs text-slate-400">Últimos 30 días</p>{stats?.porEstado?Object.entries(stats.porEstado).map(([k,v])=><div key={k} className="mb-4"><div className="mb-1 flex justify-between text-sm"><span>{k.replaceAll("_"," ")}</span><b>{v}</b></div><div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-blue-600" style={{width:`${Math.min(100,v/Math.max(1,stats.totalReservas||1)*100)}%`}}/></div></div>):<p className="text-sm text-slate-400">No hay estadísticas disponibles.</p>}</div><div className="card"><h2 className="font-bold">Accesos rápidos</h2><div className="mt-4 space-y-2"><Link className="quick-link" to="/admin/canchas"><Trophy size={17}/>Gestionar canchas<ChevronRight size={15}/></Link><Link className="quick-link" to="/admin/operacion"><CloudRain size={17}/>Alertas y recordatorios<ChevronRight size={15}/></Link><Link className="quick-link" to="/admin/reservas"><CalendarDays size={17}/>Consultar reservas<ChevronRight size={15}/></Link></div></div></div></>;
}
function AdminCourts(){
  const [items,setItems]=useState<Court[]>([]);
  const [error,setError]=useState("");
  const [formMode,setFormMode]=useState<{kind:"create"}|{kind:"edit";court:Court}|null>(null);
  const [blockCourt,setBlockCourt]=useState<Court|null>(null);
  const [busyId,setBusyId]=useState<number|null>(null);

  async function refresh(){
    setError("");
    try{setItems(await courtService.list())}
    catch(e){setError(apiError(e))}
  }
  useEffect(()=>{void refresh()},[]);

  async function remove(id:number){
    if(!confirm("¿Eliminar esta cancha? Esta acción también elimina sus bloqueos."))return;
    setBusyId(id);
    setError("");
    try{await courtService.remove(id);await refresh()}
    catch(e){setError(apiError(e))}
    finally{setBusyId(null)}
  }

  return <>
    <PageTitle eyebrow="Administración" title="Gestión de canchas" desc="Registra, edita y administra las instalaciones deportivas." action={<button className="btn-primary" onClick={()=>setFormMode({kind:"create"})}><Plus size={16}/>Nueva cancha</button>}/>
    {error&&<ErrorBox message={error}/>}
    <div className="mb-4 grid gap-3 sm:grid-cols-3">
      <Stat label="Canchas registradas" value={String(items.length)} icon={<Trophy/>}/>
      <Stat label="Activas" value={String(items.filter(c=>c.estado==="ACTIVA").length)} icon={<Check/>} tone="green"/>
      <Stat label="En mantenimiento" value={String(items.filter(c=>c.estado==="MANTENIMIENTO").length)} icon={<Settings/>} tone="amber"/>
    </div>
    <div className="card overflow-hidden p-0">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-4"><div><h2 className="font-bold text-slate-900">Instalaciones</h2><p className="mt-1 text-xs text-slate-500">Administra los datos y el estado de cada cancha.</p></div><button className="btn-secondary" onClick={()=>void refresh()}>Actualizar lista</button></div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400"><tr><th className="px-5 py-4">Cancha</th><th className="px-5 py-4">Deporte</th><th className="px-5 py-4">Horario</th><th className="px-5 py-4">Precio/hora</th><th className="px-5 py-4">Estado</th><th className="px-5 py-4">Acciones</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {items.map(c=><tr key={c.id}>
              <td className="px-5 py-4"><p className="font-semibold text-slate-900">{c.nombre}</p><p className="mt-1 text-xs text-slate-400">{c.direccion}</p></td>
              <td className="px-5 py-4 text-slate-500">{c.tipoDeporte?.replaceAll("_"," ")}<p className="mt-1 text-xs">{c.techada?"Techada":"A cielo abierto"}</p></td>
              <td className="px-5 py-4 text-slate-500">{c.horaApertura}–{c.horaCierre}</td>
              <td className="px-5 py-4 font-semibold">{money(c.precioPorHora)}</td>
              <td className="px-5 py-4"><Status value={c.estado}/></td>
              <td className="px-5 py-4"><div className="flex flex-wrap items-center gap-1">
                <button onClick={()=>setFormMode({kind:"edit",court:c})} className="rounded-lg px-2 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50">Editar</button>
                <button onClick={()=>setBlockCourt(c)} className="rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100">Bloquear</button>
                <button disabled={busyId===c.id} onClick={()=>void remove(c.id)} className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 disabled:opacity-40" title="Eliminar"><Trash2 size={16}/></button>
              </div></td>
            </tr>)}
          </tbody>
        </table>
        {!items.length&&<div className="p-8 text-center text-sm text-slate-500">No hay canchas registradas.</div>}
      </div>
    </div>
    {formMode&&<CourtFormModal key={formMode.kind==="edit"?formMode.court.id:"nueva"} court={formMode.kind==="edit"?formMode.court:undefined} onClose={()=>setFormMode(null)} onSaved={async()=>{setFormMode(null);await refresh()}}/>}
    {blockCourt&&<BlockCourtModal court={blockCourt} onClose={()=>setBlockCourt(null)} onDone={async()=>{setBlockCourt(null);await refresh()}}/>}
  </>;
}
function CourtFormModal({court,onClose,onSaved}:{court?:Court;onClose:()=>void;onSaved:()=>void}){
  const [f,setF]=useState({
    nombre:court?.nombre??"",
    tipoDeporte:court?.tipoDeporte??"FUTBOL_5",
    direccion:court?.direccion??"",
    latitud:String(court?.latitud??""),
    longitud:String(court?.longitud??""),
    precioPorHora:String(court?.precioPorHora??50000),
    techada:court?.techada??false,
    horaApertura:court?.horaApertura??"06:00",
    horaCierre:court?.horaCierre??"22:00",
    estado:court?.estado??"ACTIVA"
  });
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const set=(key:keyof typeof f,value:string|boolean)=>setF(prev=>({...prev,[key]:value}));

  async function submit(e:React.FormEvent){
    e.preventDefault();
    setBusy(true);
    setError("");
    const payload={
      nombre:f.nombre.trim(),
      tipoDeporte:f.tipoDeporte,
      direccion:f.direccion.trim(),
      latitud:Number(f.latitud),
      longitud:Number(f.longitud),
      precioPorHora:Number(f.precioPorHora),
      techada:f.techada,
      horaApertura:f.horaApertura,
      horaCierre:f.horaCierre
    };
    try{
      if(court)await courtService.update(court.id,{...payload,estado:f.estado});
      else await courtService.create(payload);
      onSaved();
    }catch(e){setError(apiError(e))}
    finally{setBusy(false)}
  }

  return <Modal title={court?`Editar · ${court.nombre}`:"Registrar nueva cancha"} onClose={onClose}>
    <form onSubmit={submit} className="space-y-4">
      <Field label="Nombre de la cancha" value={f.nombre} onChange={v=>set("nombre",v)} required/>
      <div><label className="label">Deporte</label><select className="input" value={f.tipoDeporte} onChange={e=>set("tipoDeporte",e.target.value)}>{["FUTBOL_5","FUTBOL_8","BALONCESTO","TENIS","PADEL","VOLEIBOL"].map(s=><option key={s} value={s}>{s.replaceAll("_"," ")}</option>)}</select></div>
      <Field label="Dirección" value={f.direccion} onChange={v=>set("direccion",v)} required/>
      <div className="grid grid-cols-2 gap-3"><Field label="Latitud" type="number" value={f.latitud} onChange={v=>set("latitud",v)} required/><Field label="Longitud" type="number" value={f.longitud} onChange={v=>set("longitud",v)} required/></div>
      <Field label="Precio por hora (COP)" type="number" value={f.precioPorHora} onChange={v=>set("precioPorHora",v)} required/>
      <div className="grid grid-cols-2 gap-3"><Field label="Hora de apertura" type="time" value={f.horaApertura} onChange={v=>set("horaApertura",v)} required/><Field label="Hora de cierre" type="time" value={f.horaCierre} onChange={v=>set("horaCierre",v)} required/></div>
      <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={f.techada} onChange={e=>set("techada",e.target.checked)}/>Cancha techada</label>
      {court&&<div><label className="label">Estado</label><select className="input" value={f.estado} onChange={e=>set("estado",e.target.value)}><option value="ACTIVA">Activa</option><option value="MANTENIMIENTO">En mantenimiento</option><option value="INACTIVA">Inactiva</option></select></div>}
      {error&&<ErrorBox message={error}/>}
      <div className="flex justify-end gap-2 pt-2"><button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button><button disabled={busy} className="btn-primary">{busy?"Guardando...":court?"Guardar cambios":"Registrar cancha"}</button></div>
    </form>
  </Modal>;
}
function BlockCourtModal({court,onClose,onDone}:{court:Court;onClose:()=>void;onDone:()=>void}){
  const [start,setStart]=useState("");
  const [end,setEnd]=useState("");
  const [motivo,setMotivo]=useState("Mantenimiento");
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);
  async function submit(e:React.FormEvent){
    e.preventDefault();
    setBusy(true);
    setError("");
    try{await courtService.createBlock(court.id,{fechaInicio:start,fechaFin:end,motivo});onDone()}
    catch(e){setError(apiError(e))}
    finally{setBusy(false)}
  }
  return <Modal title={`Crear bloqueo · ${court.nombre}`} onClose={onClose}>
    <form onSubmit={submit}>
      <p className="mb-4 text-sm text-slate-500">Define el periodo en el que esta cancha no estará disponible.</p>
      <Field label="Inicio" type="datetime-local" value={start} onChange={setStart} required/>
      <div className="mt-4"><Field label="Fin" type="datetime-local" value={end} onChange={setEnd} required/></div>
      <div className="mt-4"><Field label="Motivo" value={motivo} onChange={setMotivo} required/></div>
      {error&&<div className="mt-4"><ErrorBox message={error}/></div>}
      <button disabled={busy||!start||!end} className="btn-primary mt-6 w-full">{busy?"Guardando...":"Guardar bloqueo"}</button>
    </form>
  </Modal>;
}
function AdminOperations(){
  const today=new Date().toLocaleDateString("en-CA");const [date,setDate]=useState(today);const [busy,setBusy]=useState("");const [result,setResult]=useState("");const [error,setError]=useState("");
  async function run(kind:"rain"|"reminder"){setBusy(kind);setError("");setResult("");try{const data=kind==="rain"?await reservationService.sendRainAlerts(date):await reservationService.sendReminders(date);setResult(JSON.stringify(data,null,2))}catch(e){setError(apiError(e))}finally{setBusy("")}}
  return <><PageTitle eyebrow="Administración" title="Operaciones del sistema" desc="Ejecuta los procesos manuales de alertas de lluvia y recordatorios."/><div className="card max-w-3xl"><label className="label">Fecha de operación</label><input className="input max-w-xs" type="date" value={date} onChange={e=>setDate(e.target.value)}/><div className="mt-6 grid gap-3 sm:grid-cols-2"><button disabled={!!busy} onClick={()=>run("rain")} className="rounded-2xl border border-blue-100 bg-blue-50 p-5 text-left hover:border-blue-300"><CloudRain className="text-blue-600"/><b className="mt-3 block text-sm">{busy==="rain"?"Procesando...":"Enviar alertas de lluvia"}</b><span className="mt-1 block text-xs leading-5 text-slate-500">Revisa reservas confirmadas en canchas no techadas.</span></button><button disabled={!!busy} onClick={()=>run("reminder")} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left hover:border-blue-300"><Bell className="text-blue-600"/><b className="mt-3 block text-sm">{busy==="reminder"?"Procesando...":"Enviar recordatorios"}</b><span className="mt-1 block text-xs leading-5 text-slate-500">Envía recordatorios de reservas confirmadas.</span></button></div>{error&&<div className="mt-5"><ErrorBox message={error}/></div>}{result&&<pre className="mt-5 overflow-x-auto rounded-xl bg-slate-950 p-4 text-xs text-emerald-300">{result}</pre>}</div></>;
}
function Field({label,value,onChange,type="text",required=false}:{label:string;value:string;onChange:(v:string)=>void;type?:string;required?:boolean}){return <div><label className="label">{label}</label><input className="input" type={type} value={value} required={required} onChange={e=>onChange(e.target.value)}/></div>}
function Modal({title,children,onClose}:{title:string;children:React.ReactNode;onClose:()=>void}){return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"><div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"><div className="mb-5 flex items-center justify-between"><h2 className="text-lg font-bold">{title}</h2><button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X size={18}/></button></div>{children}</div></div>}
function Status({value}:{value:string}){const good=["ACTIVA","CONFIRMADA","ENVIADA","COMPLETADA"].includes(value);const bad=["CANCELADA","FALLIDA","INACTIVA","NO_ASISTIO"].includes(value);return <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${good?"bg-emerald-50 text-emerald-700":bad?"bg-rose-50 text-rose-600":"bg-amber-50 text-amber-700"}`}>{value?.replaceAll("_"," ")}</span>}
function ErrorBox({message}:{message:string}){return <div className="mb-4 flex items-start gap-2 rounded-xl border border-rose-100 bg-rose-50 p-3 text-sm text-rose-700"><AlertCircle size={17} className="mt-0.5 shrink-0"/>{message}</div>}
function Empty({title,text,action}:{title:string;text:string;action?:React.ReactNode}){return <div className="card flex flex-col items-center py-12 text-center"><div className="grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-blue-600"><Search size={24}/></div><h3 className="mt-4 font-bold">{title}</h3><p className="mt-1 max-w-sm text-sm text-slate-500">{text}</p>{action&&<div className="mt-5">{action}</div>}</div>}
function Loading(){return <div className="card flex items-center justify-center gap-3 py-10 text-sm text-slate-500"><span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"/>Cargando información...</div>}
function fmtDate(value:string){return value?new Date(`${value}T12:00:00`).toLocaleDateString("es-CO",{day:"numeric",month:"long",year:"numeric"}):"Fecha no disponible"}

function TariffNotice({tariff,estimatedHours=1}:{tariff:Tariff;estimatedHours?:number}){
  const factor=Number(tariff.factor||1);
  const recargo=Math.max(0,Math.round((factor-1)*100));
  const tieneRecargo=factor>1 && tariff.precioPorHora>tariff.precioBase;
  const totalEstimado=Math.round(tariff.precioPorHora*estimatedHours);

  let motivo="Esta fecha no es festivo ni fin de semana. Se aplica la tarifa normal.";
  if(tariff.esFestivo&&tariff.esFinDeSemana){
    motivo=`La fecha coincide con un festivo${tariff.nombreFestivo?` (${tariff.nombreFestivo})`:""} y también es fin de semana. Se aplica una sola tarifa especial, no dos recargos.`;
  }else if(tariff.esFestivo){
    motivo=`Esta fecha es festivo${tariff.nombreFestivo?`: ${tariff.nombreFestivo}`:""}.`;
  }else if(tariff.esFinDeSemana){
    motivo="Esta fecha corresponde a sábado o domingo.";
  }

  return <div className={`mt-4 rounded-xl border p-4 ${tieneRecargo?"border-amber-200 bg-amber-50":"border-emerald-100 bg-emerald-50"}`}>
    <div className="flex items-start gap-2">
      <CalendarCheck size={18} className={tieneRecargo?"mt-0.5 text-amber-700":"mt-0.5 text-emerald-700"}/>
      <div className="min-w-0 flex-1">
        <p className={`font-semibold ${tieneRecargo?"text-amber-900":"text-emerald-900"}`}>
          {tieneRecargo?"Aviso de tarifa especial":"Tarifa de la fecha seleccionada"}
        </p>
        <p className={`mt-1 text-sm ${tieneRecargo?"text-amber-800":"text-emerald-800"}`}>{motivo}</p>
        {tieneRecargo&&<p className="mt-2 text-sm font-semibold text-amber-900">
          Antes de confirmar: se aplicará un recargo del {recargo}% sobre el precio base por hora.
        </p>}
      </div>
    </div>
    <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
      <div><p className="text-xs text-slate-500">Precio base / hora</p><p className="font-semibold text-slate-700">{money(tariff.precioBase)}</p></div>
      <div><p className="text-xs text-slate-500">Precio final / hora</p><p className="font-bold text-slate-900">{money(tariff.precioPorHora)}</p></div>
    </div>
    {estimatedHours>0&&<p className="mt-3 border-t border-black/5 pt-3 text-sm font-bold text-slate-900">
      Total estimado para {estimatedHours} {estimatedHours===1?"hora":"horas"}: {money(totalEstimado)}
    </p>}
    <p className="mt-2 text-[11px] text-slate-500">El valor definitivo se confirma al guardar la reserva; el servicio aplica esta misma tarifa.</p>
  </div>;
}

function WeatherCard({reservationId}:{reservationId:number}) {
  const [forecast,setForecast]=useState<WeatherForecast|null>(null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");

  async function consultWeather(){
    setLoading(true);
    setError("");
    try{
      const result=await reservationService.weather(reservationId);
      setForecast(result);
    }catch(e){setError(apiError(e))}
    finally{setLoading(false)}
  }

  useEffect(()=>{void consultWeather()},[reservationId]);

  return <div className="mt-4 rounded-xl border border-sky-100 bg-sky-50 p-4">
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <CloudRain size={19} className="text-sky-700"/>
        <div>
          <p className="font-semibold text-sky-900">Pronóstico del clima</p>
          <p className="text-xs text-sky-700">Información de lluvia para la fecha y hora de tu reserva.</p>
        </div>
      </div>
      <button onClick={()=>void consultWeather()} disabled={loading} className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">
        {loading?"Consultando...":"Actualizar"}
      </button>
    </div>

    {loading&&!forecast&&<p className="mt-3 text-sm text-sky-800">Consultando el pronóstico...</p>}

    {forecast&&(
      <div className="mt-3">
        {!forecast.aplica ? (
          <p className="rounded-lg bg-white p-3 text-sm text-slate-600">El pronóstico de lluvia no aplica porque esta cancha es techada.</p>
        ) : !forecast.pronosticoDisponible ? (
          <p className="rounded-lg bg-white p-3 text-sm text-slate-600">El pronóstico no está disponible para esta fecha. La reserva sigue confirmada.</p>
        ) : (
          <div className="rounded-lg bg-white p-3">
            <p className="text-sm font-semibold text-slate-800">Probabilidad de lluvia</p>
            <p className="my-2 text-3xl font-bold text-blue-700">{forecast.probabilidadLluvia ?? "—"}%</p>
            <div className={`rounded-lg p-2 text-sm font-semibold ${forecast.riesgoLluvia?"bg-amber-100 text-amber-800":"bg-emerald-100 text-emerald-800"}`}>
              {forecast.riesgoLluvia?"⚠️ Hay riesgo de lluvia para tu reserva.":"✓ No se supera el umbral de riesgo de lluvia."}
            </div>
            <p className="mt-2 text-xs text-slate-500">Umbral de alerta: {forecast.umbral}%</p>
          </div>
        )}
      </div>
    )}

    {error&&<p className="mt-2 text-sm text-red-600">No fue posible consultar el clima: {error}</p>}
  </div>;
}