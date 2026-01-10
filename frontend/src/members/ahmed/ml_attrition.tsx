import {useState} from 'react'
import {motion} from 'framer-motion'
import {UserX,Send,RotateCcw,Loader2,AlertCircle,CheckCircle} from 'lucide-react'

interface FormData{
Age:number;Years_at_Company:number;Monthly_Income:number;Number_of_Promotions:number;Distance_from_Home:number;Number_of_Dependents:number
Work_Life_Balance:string;Job_Satisfaction:string;Performance_Rating:string;Employee_Recognition:string
Overtime:string;Leadership_Opportunities:string;Innovation_Opportunities:string
Company_Reputation:string;Job_Role:string;Job_Level:string;Company_Size:string
Remote_Work:string;Education_Level:string;Gender:string;Marital_Status:string
}

const initialFormData:FormData={
Age:35,Years_at_Company:3,Monthly_Income:5000,Number_of_Promotions:0,Distance_from_Home:10,Number_of_Dependents:0,
Work_Life_Balance:'Good',Job_Satisfaction:'Medium',Performance_Rating:'Average',Employee_Recognition:'Medium',
Overtime:'No',Leadership_Opportunities:'No',Innovation_Opportunities:'No',
Company_Reputation:'Good',Job_Role:'Finance',Job_Level:'Mid',Company_Size:'Medium',
Remote_Work:'No',Education_Level:"Bachelor's Degree",Gender:'Male',Marital_Status:'Single'
}

export default function MLAttrition(){
const[f,setF]=useState(initialFormData)
const[l,setL]=useState(false)
const[r,setR]=useState<number|null>(null)
const[e,setE]=useState<string|null>(null)
const u=(k:keyof FormData,v:any)=>{setF(p=>({...p,[k]:v}));setE(null)}
const i=(v:number,min:number,max:number)=>Math.min(max,Math.max(min,Math.trunc(Number.isFinite(v)?v:0)))
const n=(v:number,min:number,max:number)=>Math.min(max,Math.max(min,Number.isFinite(v)?v:0))
const submit=async()=>{
setL(true);setR(null);setE(null)
try{
const res=await fetch('http://127.0.0.1:8000/attrition/predict',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(f)})
if(!res.ok)throw 0
const d=await res.json()
setR(d.prediction)
}catch{setE('Backend error')}
setL(false)
}
const risk=r===null?null:r===1?'High':'Low'
return(
<div className="space-y-6">
<div className="space-y-4">
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
<div className="space-y-2"><label className="text-sm font-medium">Age</label><input className="input-field w-full" type="number" min={0} max={100} step={1} value={f.Age} onChange={e=>u('Age',i(+e.target.value,0,100))}/></div>
<div className="space-y-2"><label className="text-sm font-medium">Monthly Income</label><input className="input-field w-full" type="number" min={0} max={1000000} step={1} value={f.Monthly_Income} onChange={e=>u('Monthly_Income',n(+e.target.value,0,1000000))}/></div>
<div className="space-y-2"><label className="text-sm font-medium">Years at Company</label><input className="input-field w-full" type="number" min={0} max={60} step={1} value={f.Years_at_Company} onChange={e=>u('Years_at_Company',i(+e.target.value,0,60))}/></div>
<div className="space-y-2"><label className="text-sm font-medium">Distance from Home</label><input className="input-field w-full" type="number" min={0} max={500} step={1} value={f.Distance_from_Home} onChange={e=>u('Distance_from_Home',i(+e.target.value,0,500))}/></div>
<div className="space-y-2"><label className="text-sm font-medium">Number of Promotions</label><input className="input-field w-full" type="number" min={0} max={20} step={1} value={f.Number_of_Promotions} onChange={e=>u('Number_of_Promotions',i(+e.target.value,0,20))}/></div>
<div className="space-y-2"><label className="text-sm font-medium">Number of Dependents</label><input className="input-field w-full" type="number" min={0} max={20} step={1} value={f.Number_of_Dependents} onChange={e=>u('Number_of_Dependents',i(+e.target.value,0,20))}/></div>

<div className="space-y-2"><label className="text-sm font-medium">Company Reputation</label><select className="input-field w-full" value={f.Company_Reputation} onChange={e=>u('Company_Reputation',e.target.value)}>{['Excellent','Good','Fair','Poor'].map(x=><option key={x} value={x}>{x}</option>)}</select></div>
<div className="space-y-2"><label className="text-sm font-medium">Job Role</label><select className="input-field w-full" value={f.Job_Role} onChange={e=>u('Job_Role',e.target.value)}>{['Finance','Healthcare','Media','Technology'].map(x=><option key={x} value={x}>{x}</option>)}</select></div>
<div className="space-y-2"><label className="text-sm font-medium">Job Level</label><select className="input-field w-full" value={f.Job_Level} onChange={e=>u('Job_Level',e.target.value)}>{['Mid','Senior'].map(x=><option key={x} value={x}>{x}</option>)}</select></div>
<div className="space-y-2"><label className="text-sm font-medium">Company Size</label><select className="input-field w-full" value={f.Company_Size} onChange={e=>u('Company_Size',e.target.value)}>{['Small','Medium'].map(x=><option key={x} value={x}>{x}</option>)}</select></div>
<div className="space-y-2"><label className="text-sm font-medium">Education Level</label><select className="input-field w-full" value={f.Education_Level} onChange={e=>u('Education_Level',e.target.value)}>{["High School","Bachelor's Degree","Master's Degree","PhD"].map(x=><option key={x} value={x}>{x}</option>)}</select></div>
<div className="space-y-2"><label className="text-sm font-medium">Gender</label><select className="input-field w-full" value={f.Gender} onChange={e=>u('Gender',e.target.value)}>{['Female','Male'].map(x=><option key={x} value={x}>{x}</option>)}</select></div>
<div className="space-y-2"><label className="text-sm font-medium">Marital Status</label><select className="input-field w-full" value={f.Marital_Status} onChange={e=>u('Marital_Status',e.target.value)}>{['Single','Married'].map(x=><option key={x} value={x}>{x}</option>)}</select></div>

<div className="space-y-2"><label className="text-sm font-medium">Work-Life Balance</label><select className="input-field w-full" value={f.Work_Life_Balance} onChange={e=>u('Work_Life_Balance',e.target.value)}>{['Poor','Fair','Good','Excellent'].map(x=><option key={x} value={x}>{x}</option>)}</select></div>
<div className="space-y-2"><label className="text-sm font-medium">Job Satisfaction</label><select className="input-field w-full" value={f.Job_Satisfaction} onChange={e=>u('Job_Satisfaction',e.target.value)}>{['Low','Medium','High','Very High'].map(x=><option key={x} value={x}>{x}</option>)}</select></div>
<div className="space-y-2"><label className="text-sm font-medium">Performance Rating</label><select className="input-field w-full" value={f.Performance_Rating} onChange={e=>u('Performance_Rating',e.target.value)}>{['Low','Below Average','Average','High'].map(x=><option key={x} value={x}>{x}</option>)}</select></div>
<div className="space-y-2"><label className="text-sm font-medium">Employee Recognition</label><select className="input-field w-full" value={f.Employee_Recognition} onChange={e=>u('Employee_Recognition',e.target.value)}>{['Low','Medium','High','Very High'].map(x=><option key={x} value={x}>{x}</option>)}</select></div>

<div className="space-y-2"><label className="text-sm font-medium">Overtime</label><select className="input-field w-full" value={f.Overtime} onChange={e=>u('Overtime',e.target.value)}>{['No','Yes'].map(x=><option key={x} value={x}>{x}</option>)}</select></div>
<div className="space-y-2"><label className="text-sm font-medium">Remote Work</label><select className="input-field w-full" value={f.Remote_Work} onChange={e=>u('Remote_Work',e.target.value)}>{['No','Yes'].map(x=><option key={x} value={x}>{x}</option>)}</select></div>
<div className="space-y-2"><label className="text-sm font-medium">Leadership Opportunities</label><select className="input-field w-full" value={f.Leadership_Opportunities} onChange={e=>u('Leadership_Opportunities',e.target.value)}>{['No','Yes'].map(x=><option key={x} value={x}>{x}</option>)}</select></div>
<div className="space-y-2"><label className="text-sm font-medium">Innovation Opportunities</label><select className="input-field w-full" value={f.Innovation_Opportunities} onChange={e=>u('Innovation_Opportunities',e.target.value)}>{['No','Yes'].map(x=><option key={x} value={x}>{x}</option>)}</select></div>
</div>

{e&&<motion.div initial={{opacity:0}} animate={{opacity:1}} className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm"><AlertCircle className="w-4 h-4"/>{e}</motion.div>}
</div>

<div className="flex gap-3">
<button onClick={submit} disabled={l} className="btn-primary flex items-center gap-2">{l?<Loader2 className="w-4 h-4 animate-spin"/>:<Send className="w-4 h-4"/>}{l?'Analyzing...':'Run Analysis'}</button>
<button onClick={()=>{setF(initialFormData);setR(null);setE(null)}} className="btn-secondary flex items-center gap-2"><RotateCcw className="w-4 h-4"/>Reset</button>
</div>

<div className="min-h-[160px]">
{l&&<div className="card-result h-24 shimmer"/>}
{risk&&(
<motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="card-result">
<div className="flex items-center gap-2 mb-2">
{risk==='High'?<AlertCircle className="text-destructive"/>:<CheckCircle className="text-emerald-500"/>}
<h4 className="font-semibold">Attrition Risk</h4>
</div>
<p className={`text-2xl font-bold ${risk==='High'?'text-destructive':'text-emerald-500'}`}>{risk}</p>
</motion.div>
)}
</div>
</div>
)
}

export const mlAttritionConfig={id:'attrition',title:'Attrition Risk',description:'Predict employee attrition risk',icon:UserX,component:MLAttrition,disabled:false}