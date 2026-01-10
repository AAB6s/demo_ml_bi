import {useState} from 'react'
import {motion} from 'framer-motion'
import {Globe,Send,RotateCcw,Loader2,AlertCircle,CheckCircle} from 'lucide-react'

interface FormData{
job_title: string;
company: string;
skills: string;
country: string;
}

const initialFormData: FormData = {
job_title: 'Software Engineer',
company: 'Tech Corp',
skills: 'Python, Machine Learning, Data Analysis',
country: 'USA'
}

export default function MLRemote(){
const[f,setF]=useState(initialFormData)
const[l,setL]=useState(false)
const[r,setR]=useState<number|null>(null)
const[e,setE]=useState<string|null>(null)
const u=(k:keyof FormData,v:any)=>{setF(p=>({...p,[k]:v}));setE(null)}
const submit=async()=>{
setL(true);setR(null);setE(null)
try{
const res=await fetch('http://127.0.0.1:8000/remote/predict',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(f)})
if(!res.ok){
const err=await res.json()
throw new Error(err.detail || 'Backend error')
}
const d=await res.json()
setR(d.prediction)
}catch(e){setE((e as Error).message || 'Backend error')}
setL(false)
}
const result=r===null?null:r===1?'Remote':'On-site'
return(
<div className="space-y-6">
<div className="space-y-4">
<div className="grid grid-cols-1 gap-4">
<div className="space-y-2"><label className="text-sm font-medium">Job Title</label><input className="input-field w-full" type="text" value={f.job_title} onChange={e=>u('job_title',e.target.value)}/></div>
<div className="space-y-2"><label className="text-sm font-medium">Company</label><input className="input-field w-full" type="text" value={f.company} onChange={e=>u('company',e.target.value)}/></div>
<div className="space-y-2"><label className="text-sm font-medium">Skills</label><textarea className="input-field w-full" rows={3} value={f.skills} onChange={e=>u('skills',e.target.value)}/></div>
<div className="space-y-2"><label className="text-sm font-medium">Country</label><input className="input-field w-full" type="text" value={f.country} onChange={e=>u('country',e.target.value)}/></div>
</div>
</div>
<div className="flex gap-3">
<button onClick={submit} disabled={l} className="btn-primary flex items-center gap-2">
{l?<Loader2 className="w-4 h-4 animate-spin"/>:<Send className="w-4 h-4"/>}
Predict
</button>
<button onClick={()=>setF(initialFormData)} className="btn-secondary flex items-center gap-2">
<RotateCcw className="w-4 h-4"/>
Reset
</button>
</div>
{r!==null&&(
<motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="p-4 rounded-lg border bg-card">
<div className="flex items-center gap-3">
{r===1?<CheckCircle className="w-5 h-5 text-green-500"/>:<AlertCircle className="w-5 h-5 text-blue-500"/>}
<div>
<h3 className="font-medium">Prediction Result</h3>
<p className="text-sm text-muted-foreground">This job is likely: <span className="font-semibold">{result}</span></p>
</div>
</div>
</motion.div>
)}
{e&&(
<motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="p-4 rounded-lg border border-destructive bg-destructive/10">
<div className="flex items-center gap-3">
<AlertCircle className="w-5 h-5 text-destructive"/>
<div>
<h3 className="font-medium">Error</h3>
<p className="text-sm text-muted-foreground">{e}</p>
</div>
</div>
</motion.div>
)}
</div>
)
}

export const mlRemoteConfig={id:'remote',title:'Remote Job Prediction',description:'Predict if a job is remote',icon:Globe,component:MLRemote,disabled:false}