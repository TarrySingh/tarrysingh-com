'use strict';
const exercises={
 leg_press:['Leg press','leg_press','Quads · glutes','Keep your back and pelvis supported. Knees follow toes.','10–15',3],
 machine_press:['Machine chest press','machine_press','Chest · shoulders · triceps','Set handles at mid-chest and press smoothly.','10–15',3],
 supported_row:['Chest-supported row','row','Back · biceps','Keep your chest on the pad; pull elbows back.','10–15',3],
 leg_curl:['Seated leg curl','leg_curl','Hamstrings','Align knees with the machine pivot; control the return.','10–15',2],
 lateral:['Dumbbell lateral raise','lateral_raise','Side shoulders','Raise with soft elbows to a comfortable height.','12–20',2],
 calf_stand:['Standing calf raise','calf','Calves','Use support and move without bouncing.','10–15',2],
 triceps:['Cable triceps pushdown','triceps','Triceps','Keep elbows near your sides and avoid swinging.','10–15',2],
 deadbug:['Dead bug','dead_bug','Abdominals · trunk','Exhale as opposite arm and leg extend.','6–10 / side',2],
 hinge:['Dumbbell Romanian deadlift','hinge','Hamstrings · glutes','Move hips back and keep dumbbells close.','10–12',3],
 incline:['Low-incline dumbbell press','incline_press','Chest · shoulders · triceps','Set bench to a low incline; keep feet planted.','10–15',3],
 pulldown:['Neutral-grip lat pulldown','pulldown','Lats · biceps','Pull towards your upper chest without swinging.','10–15',3],
 split:['Supported split squat','split_squat','Quads · glutes','Hold a stable support and lower under control.','8–12 / leg',2],
 shoulder:['Seated shoulder press','shoulder_press','Shoulders · triceps','Keep your back supported and ribs from flaring.','10–15',2],
 curl:['Cable or dumbbell curl','curl','Biceps','Keep upper arms still; lower slowly.','10–15',2],
 calf_seated:['Seated calf raise','calf','Calves','Use comfortable movement without bouncing.','12–20',2],
 pallof:['Pallof press','pallof','Abdominals · trunk','Press away and return without turning.','8–12 / side',2],
 row:['Seated cable row','row','Back · biceps','Sit tall and bring the handle toward lower ribs.','10–15',3],
 hammer:['Hammer curl','curl','Biceps · forearms','Keep palms facing each other; avoid swinging.','10–15',2],
 crunch:['Cable crunch','cable_crunch','Abdominals','Curl ribs toward pelvis and breathe steadily.','10–15',2]};
const defaultPlans={A:['leg_press','machine_press','supported_row','leg_curl','lateral','calf_stand','triceps','deadbug'],B:['hinge','incline','pulldown','split','shoulder','curl','calf_seated','pallof'],C:['leg_press','machine_press','row','leg_curl','lateral','triceps','hammer','crunch']};
// Source snapshot: yuhonas/free-exercise-db, Unlicense. IDs remain stable across sessions.
for (const e of [...(window.exerciseData || []),...(window.modernExerciseData || [])]) {
 const id='db_'+e.id;
 exercises[id]=[e.name, null, e.primaryMuscles.join(' · ') || 'Full body', e.instructions[0] || 'Use a controlled range of motion.', ['cardio','stretching'].includes(e.category)?'choose target':'8–12', ['cardio','stretching'].includes(e.category)?1:3];
 exercises[id].meta=e;
}
let customExercises=[],plans=structuredClone(defaultPlans), librarySearch='',libraryMuscle='',libraryEquipment='',libraryCategory='',libraryPage=0;
const imageBase='https://raw.githubusercontent.com/yuhonas/free-exercise-db/f00c92c7dcf1216a928a52c3706c7ce8e2f71ed5/exercises/';
function copyPlans(value){return Object.fromEntries(['A','B','C'].map(t=>[t,Array.isArray(value?.[t]) ? value[t].filter(id=>typeof id==='string'&&exercises[id]) : [...defaultPlans[t]]]));}
function installCustom(e){if(!e||!/^custom_[a-z0-9-]+$/.test(e.id)||!e.name)return;exercises[e.id]=[e.name,null,e.primaryMuscles?.join(' · ')||'Full body',e.instructions?.[0]||'Use a controlled range of motion.','8–12',3];exercises[e.id].meta=e;}
async function loadPlans(){const {data,error}=await window.gymBackend.from('gym_plans').select('sessions,custom_exercises').maybeSingle();if(error)throw error;customExercises=Array.isArray(data?.custom_exercises)?data.custom_exercises:[];customExercises.forEach(installCustom);plans=copyPlans(data?.sessions);}
async function addCustom(event){event.preventDefault();if(savingPlan)return;const form=event.target,name=form.elements.namedItem('name').value.trim(),muscle=form.elements.namedItem('muscle').value.trim(),equipment=form.elements.namedItem('equipment').value.trim(),instruction=form.elements.namedItem('instruction').value.trim();if(!name||!muscle)return;const item={id:'custom_'+crypto.randomUUID(),name,primaryMuscles:[muscle.toLowerCase()],secondaryMuscles:[],equipment:equipment||'other',category:'strength',level:'',instructions:instruction?[instruction]:[],images:[],source:'Custom'};const next=[...customExercises,item];savingPlan=true;try{const {error}=await window.gymBackend.from('gym_plans').upsert({user_id:currentUser.id,sessions:plans,custom_exercises:next});if(error)throw error;customExercises=next;installCustom(item);librarySearch=name;libraryMuscle='';libraryEquipment='';libraryCategory='';libraryPage=0;toast('Custom exercise saved to your account.');render()}catch(e){alert('Could not save your exercise. Please retry.')}finally{savingPlan=false}}

let savingPlan=false;
async function changePlan(t,id,remove=false){
 if(savingPlan)return; if(!['A','B','C'].includes(t)||!exercises[id])return;
 if(!remove&&plans[t].includes(id)){toast('Already in session '+t+'.');return;}
 if(remove&&draft?.tab===t){let item=draft.items.find(x=>x.id===id);if(item?.sets.some(s=>s.weight!==''||s.reps!=='')&&!confirm('Remove this exercise and its unfinished entries from the draft?'))return;}
 const next=copyPlans(plans);next[t]=remove?next[t].filter(x=>x!==id):[...next[t],id];savingPlan=true;
 try{const {error}=await window.gymBackend.from('gym_plans').upsert({user_id:currentUser.id,sessions:next,custom_exercises:customExercises});if(error)throw error;plans=next;
 if(draft?.tab===t){if(remove)draft.items=draft.items.filter(x=>x.id!==id);else if(!draft.items.some(x=>x.id===id))draft.items.push({id,sets:Array.from({length:exercises[id][5]},()=>({weight:'',reps:''}))});saveDraft()}
 toast(remove?'Removed from session '+t+'.':'Added to session '+t+'.');render();}catch(e){alert('Could not save your session. Check your connection and try again.')}finally{savingPlan=false;}
}
const key='stronger-workouts-v1',draftKey='stronger-draft-v2',measureKey='stronger-measurements-v1';let tab='A',page='today',draft=null,timer=null,remaining=90; let currentUser=null, cloudRows=[];const $=s=>document.querySelector(s);function esc(x){return String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}function load(k,fallback){try{let v=localStorage.getItem(k);return v?JSON.parse(v):fallback}catch(e){return fallback}}function put(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){alert('Browser storage is unavailable. Your data was not saved.');return false}}function history(){return cloudRows.filter(r=>r.kind==='workout').map(r=>({...r.payload,_id:r.id,date:r.occurred_at}))} function measurements(){return cloudRows.filter(r=>r.kind==='measurement').map(r=>({...r.payload,_id:r.id,date:r.occurred_at}))} async function refreshCloud(){const {data,error}=await window.gymBackend.from('gym_records').select('id,kind,occurred_at,payload').order('occurred_at',{ascending:false});if(error)throw error;cloudRows=data} async function addCloud(kind,payload){let {data,error}=await window.gymBackend.from('gym_records').insert({kind,occurred_at:new Date().toISOString(),payload}).select('id,kind,occurred_at,payload').single();if(error)throw error;cloudRows.unshift(data)} async function deleteCloud(id){let {data,error}=await window.gymBackend.from('gym_records').delete().eq('id',id).select('id');if(error||!data.length)throw error||Error('Record unavailable');cloudRows=cloudRows.filter(r=>r.id!==id)}function toast(t){let el=$('#toast');el.textContent=t;el.style.display='block';setTimeout(()=>el.style.display='none',2500)}
function newDraft(t){return {tab:t,date:new Date().toISOString(),items:plans[t].map(id=>({id,sets:Array.from({length:exercises[id][5]},()=>({weight:'',reps:''}))}))}}function saveDraft(){put(draftKey+':'+currentUser.id,draft)}function selectTab(t){if(draft&&draft.items.some(i=>i.sets.some(s=>s.weight!==''||s.reps!==''))&&!confirm('Switch sessions and discard the current unsaved entries?'))return;tab=t;draft=newDraft(t);saveDraft();render()}
function setTitle(){let data={today:['Your next session.','Show up, record the work, and let consistency do its thing.'],history:['See how far you’ve come.','Your work, captured one set at a time.'],library:['Move with intention.','Find your next movement and add it to your programme.'],settings:['Your data, your call.','Manage local backups and understand what is connected.']}[page];$('#page-title').textContent=data[0];$('#page-sub').textContent=data[1];document.querySelectorAll('[data-page]').forEach(x=>x.classList.toggle('active',x.dataset.page===page))}function goto(p){page=p;render();window.scrollTo(0,0)}document.addEventListener('click',e=>{let b=e.target.closest('[data-page]');if(b)goto(b.dataset.page)});
// Exact exercise matches only: do not infer photos from similar names or equipment.
const exerciseVisuals={
 'db_Leg_Press':'leg_press',
 'leg_curl':'seated_leg_curl-v2',
 'db_Seated_Leg_Curl':'seated_leg_curl-v2',
 'db_modern_side_plank':'side_plank-v2',
 'db_Barbell_Deadlift':'barbell_deadlift-v2',
 'db_modern_barbell_deadlift':'barbell_deadlift-v2',
 'db_Dumbbell_Step_Ups':'dumbbell_step_up-v2',
 'db_Cable_Rope_Overhead_Triceps_Extension':'cable_overhead_triceps-v2',
 'db_Cable_Hammer_Curls_-_Rope_Attachment':'cable_hammer-v2',
 'db_Face_Pull':'face_pull-v2',
 'db_Dip_Machine':'dip_machine-v2',
 'db_modern_triceps_dip_machine':'dip_machine-v2',
 'db_Machine_Bicep_Curl':'machine_bicep-v2',
 'db_Machine_Preacher_Curls':'machine_bicep-v2',
 'db_Thigh_Adductor':'thigh_adductor-v2',
 'calf_seated':'seated_calf_machine-v2',
 'db_Seated_Calf_Raise':'seated_calf_machine-v2',
 'db_machine_plate_loaded_seated_calf_raise':'seated_calf_machine-v2',
 'db_Standing_Cable_Wood_Chop':'cable_woodchop-v2',
 'db_Standing_Calf_Raises':'standing_calf_machine-v2',
 'db_Reverse_Crunch':'reverse_crunch-v2',
 'db_Air_Bike':'bicycle_crunch-v2',
 'db_modern_bicycles_crunches':'bicycle_crunch-v2',
 'db_One-Arm_Dumbbell_Row':'dumbbell_row-v2',
 'db_Dumbbell_Lying_Rear_Lateral_Raise':'lying_rear_delt-v2',
 'supported_row':'chest_supported_row-v2',
 'db_Leverage_Iso_Row':'chest_supported_row-v2',
 'db_Incline_Hammer_Curls':'incline_hammer-v2',
 'db_Cable_Chest_Press':'cable_chest_press-v2',
 'db_Standing_Biceps_Cable_Curl':'cable_curl-v2',
 'db_modern_bicep_curl_low_cable_machine_normal_grip':'cable_curl-v2',
 'db_modern_biceps_curl_cable':'cable_curl-v2',
 'db_Reverse_Machine_Flyes':'reverse_pecdeck-v2',
 'db_Front_Two-Dumbbell_Raise':'front_raise-v2',
 'db_modern_dumbbell_front_raise':'front_raise-v2',
 'db_Pullups':'pull_up-v2',
 'db_EZ-Bar_Skullcrusher':'skullcrusher-v2',
 'db_Triceps_Pushdown':'triceps_bar-v2',
 'db_Dumbbell_Flyes':'dumbbell_fly-v2',
 'db_Preacher_Curl':'preacher_curl-v2',
 'db_Butterfly':'pec_deck-v2',
 'db_Cable_Crossover':'cable_crossover-v2',
 'db_Bent_Over_Barbell_Row':'barbell_row-v2',
 'db_modern_barbell_bent_over_row':'barbell_row-v2',
 'db_Lying_Leg_Curls':'lying_leg_curl-v2',
 'db_Standing_Military_Press':'standing_barbell_press-v2',
 'db_Butt_Lift_Bridge':'glute_bridge-v2',
 'db_Dumbbell_Lunges':'dumbbell_lunge-v2',
 'db_Split_Squat_with_Dumbbells':'dumbbell_lunge-v2',
 'db_modern_dumbbell_split_squat':'dumbbell_lunge-v2',
 'db_Plank':'plank-v2',
 'db_modern_plank_on_elbows':'plank-v2',
 'db_Machine_Bench_Press':'machine_press',
 'db_Dumbbell_Shoulder_Press':'shoulder_press',
 'db_Barbell_Curl':'barbell_curl-v2',
 'db_modern_barbell_bicep_curl_normal_grip':'barbell_curl-v2',
 'db_modern_barbell_biceps_curl':'barbell_curl-v2',
 'db_modern_barbell_curl':'barbell_curl-v2',
 'hammer':'hammer_curl-v2',
 'db_Hammer_Curls':'hammer_curl-v2',
 'db_modern_dumbbell_hammer_curl':'hammer_curl-v2',
 'db_Barbell_Hip_Thrust':'hip_thrust-v2',
 'db_modern_barbell_hip_thrust':'hip_thrust-v2',
 'db_Leg_Extensions':'leg_extension-v2',
 'db_modern_normal_push_up':'push_up-v2',
 'db_modern_push_ups_bodyweight':'push_up-v2',
 'db_Dumbbell_Bench_Press':'dumbbell_bench-v2',
 'db_modern_dumbbell_bench_press':'dumbbell_bench-v2',
 'db_modern_dumbbell_chest_press_flat':'dumbbell_bench-v2',
 'db_Wide-Grip_Lat_Pulldown':'wide_pulldown-v2',
 'db_Romanian_Deadlift':'barbell_rdl-v2',
 'db_modern_barbell_romanian_deadlift':'barbell_rdl-v2',
 'db_modern_romanian_deadlift_barbell':'barbell_rdl-v2',
 'db_Barbell_Squat':'barbell_squat-v2',
 'db_machine_pendulum_squat':'pendulum_squat-v2',
 'db_machine_belt_squat_machine':'belt_squat-v2',
 'db_Dead_Bug':'dead_bug',
 'db_Pallof_Press':'pallof',
 'db_Cable_Crunch':'cable_crunch',
 'db_Dumbbell_Bicep_Curl':'curl',
 'db_modern_dumbbell_simultaneous_biceps_curl':'curl',
 'db_Incline_Dumbbell_Press':'incline_press',
 'db_modern_dumbbell_chest_press_incline_bench':'incline_press',
 'db_Seated_Cable_Rows':'row',
 'db_Side_Lateral_Raise':'lateral_raise',
 'db_Triceps_Pushdown_-_Rope_Attachment':'triceps',
 'db_modern_bodyweight_calf_raises':'calf',
 'db_modern_v_bar_lat_pull_down':'pulldown'
};
// Each pair is reviewed as an illustrative still sequence, not a motion demonstration.
const exerciseSecondVisuals={'hammer':'hammer_curl-position2','db_Hammer_Curls':'hammer_curl-position2','db_modern_dumbbell_hammer_curl':'hammer_curl-position2','db_Barbell_Hip_Thrust':'hip_thrust-position2','db_modern_barbell_hip_thrust':'hip_thrust-position2','db_modern_normal_push_up':'push_up-position2','db_modern_push_ups_bodyweight':'push_up-position2','db_Barbell_Squat':'barbell_squat-position2','db_Romanian_Deadlift':'barbell_rdl-position2','db_modern_barbell_romanian_deadlift':'barbell_rdl-position2','db_modern_romanian_deadlift_barbell':'barbell_rdl-position2'};
function img(id){let e=exercises[id];return exerciseVisuals[id] ? 'assets/'+exerciseVisuals[id]+'.webp' : e.meta?.images?.length ? imageBase+e.meta.images[0].split('/').map(encodeURIComponent).join('/') : e[1]?'assets/'+e[1]+'.webp':''}function imageMarkup(id){const url=img(id);if(!url)return `<div class="image-placeholder" aria-label="No exercise image available"><span>✳</span><small>REFERENCE IMAGE COMING SOON</small></div>`;const alt=exerciseSecondVisuals[id];if(!alt)return `<img src="${esc(url)}" alt="${esc(exercises[id][0])} reference image" loading="lazy">`;return `<div class="visual-pair"><img src="${esc(url)}" alt="${esc(exercises[id][0])}, position 1 of 2, AI-generated illustration" loading="lazy"><div class="visual-controls" role="group" aria-label="${esc(exercises[id][0])} reference positions"><button type="button" data-frame="1" data-id="${esc(id)}" aria-pressed="true">Position 1</button><button type="button" data-frame="2" data-id="${esc(id)}" aria-pressed="false">Position 2</button></div></div>`}function card(id,i){let e=exercises[id],item=draft.items[i];return `<article class="exercise"><div class="exercise-head">${imageMarkup(id)}<div><div class="target">${esc(e[2])}</div><h3>${esc(e[0])}</h3><p>${esc(e[3])}</p></div><div class="small muted">GUIDE<br><strong>${e[5]} × ${esc(e[4])}</strong><br><button class="add" data-remove-exercise="${esc(id)}">Remove exercise</button></div></div><div class="sets"><div class="set-head"><span>SET</span><span>WEIGHT · KG</span><span>REPS</span><span></span></div>${item.sets.map((s,j)=>`<div class="set"><span>${String(j+1).padStart(2,'0')}</span><input aria-label="${esc(e[0])} set ${j+1} weight in kg" type="number" min="0" step="0.25" inputmode="decimal" placeholder="—" data-i="${i}" data-j="${j}" data-field="weight" value="${esc(s.weight)}"><input aria-label="${esc(e[0])} set ${j+1} repetitions" type="number" min="1" step="1" inputmode="numeric" placeholder="—" data-i="${i}" data-j="${j}" data-field="reps" value="${esc(s.reps)}"><button class="icon" data-remove="${i},${j}" aria-label="Remove set">×</button></div>`).join('')}<button class="add" data-add="${i}">+ Add set</button></div></article>`}
function today(){if(!draft){draft=load(draftKey+':'+currentUser.id,null)||newDraft(tab);draft.items=draft.items.filter(x=>exercises[x.id]);for(const id of plans[draft.tab]||[])if(!draft.items.some(x=>x.id===id))draft.items.push({id,sets:Array.from({length:exercises[id][5]},()=>({weight:'',reps:''}))});saveDraft()}tab=draft.tab;let h=history(),count=h.length;return `<div class="grid"><div><section class="card hero"><div class="eyebrow">THE LONG GAME / 36 WEEKS</div><h2>Strong looks good on you.</h2><p>Three full-body sessions built around your goals. Choose your session and make today count.</p><div class="pills"><span class="pill">✦ Strength & muscle</span><span class="pill">◷ 48h between sessions</span><span class="pill">↗ Progress at your pace</span></div></section><section class="card"><div class="section-head"><div><div class="eyebrow">YOUR PROGRAMME</div><h2>Session ${tab}</h2></div><div class="tabs">${Object.keys(plans).map(t=>`<button class="${t===tab?'selected':''}" data-tab="${t}">${t}</button>`).join('')}</div></div><p class="muted small">Suggested sets and reps are guides. Enter your actual work below. Session choices sync to your account. Drafts save on this device; completed sessions save to your account.</p>${draft.items.map((x,i)=>card(x.id,i)).join('')}<div class="actions"><button class="primary" id="finish">Save workout</button><button class="secondary" id="clear">Clear draft</button></div><p class="small muted">Week 1–2: use 2 sets per movement. Thereafter use the guide as recovery allows. Keep approximately 3 reps in reserve.</p></section></div><div><section class="card"><div class="eyebrow">YOUR MOMENTUM</div><div class="summary">${count}</div><h2>Sessions logged</h2><p class="muted">Every session is a step toward a stronger you.</p><div class="divider"></div><div class="eyebrow">REST TIMER</div><p><strong id="clock">${Math.floor(remaining/60)}:${String(remaining%60).padStart(2,'0')}</strong> <span class="muted small">minutes : seconds</span></p><div class="actions"><button class="secondary" id="timer">${timer?'Pause':'Start'} 90 sec</button><button class="icon" id="reset-timer">Reset</button></div></section><section class="card"><div class="eyebrow">BEFORE YOU BEGIN</div><h2>Move well. Breathe.</h2><p class="muted">Warm up gradually, rest between sets, and stop before grinding. Follow your clinician’s exercise limits.</p><div class="tip">Stop for chest pressure, unusual breathlessness, dizziness or palpitations. Severe or persistent chest discomfort: call 112.</div></section><section class="card"><div class="eyebrow">EXERCISE VISUALS</div><p class="small muted">Images show a single position, not a movement demonstration. Check unfamiliar technique with a trainer.</p></section></div></div>`}
function progress(){let h=history(),m=measurements();let total=h.reduce((n,x)=>n+(Array.isArray(x.sets)?x.sets.length:0),0);let opts=Object.keys(exercises).map(k=>`<option value="${k}">${esc(exercises[k][0])}</option>`).join('');return `<div class="grid"><div><section class="card"><div class="section-head"><div><div class="eyebrow">YOUR TRAINING</div><h2>Progress over time</h2></div></div><div class="metrics"><div class="metric"><span class="label">Sessions</span><strong>${h.length}</strong></div><div class="metric"><span class="label">Sets logged</span><strong>${total}</strong></div><div class="metric"><span class="label">Latest weight</span><strong>${m.length?esc(m[0].weight)+' kg':'—'}</strong></div></div><div class="divider"></div><label class="label" for="chartExercise">Top logged weight by exercise</label><select id="chartExercise">${opts}</select><div id="chart"></div><p class="small muted">Shows the highest recorded set weight in each session, not a one-rep maximum. Compare reps and technique before drawing conclusions.</p></section><section class="card"><div class="eyebrow">YOUR RECORD</div><h2>Workout history</h2><div id="history-list">${h.length?h.map((w,i)=>`<div class="history-item"><strong>${esc(new Date(w.date).toLocaleDateString())} · ${esc(w.workout)}</strong><p class="small muted">${(w.sets||[]).map(s=>`${esc(s.name)} ${esc(s.weight)} kg × ${esc(s.reps)}`).join(' · ')}</p><button class="danger small" data-delete="${i}">Delete</button></div>`).join(''):'<div class="empty">Your saved sessions will appear here.</div>'}</div></section></div><div><section class="card"><div class="eyebrow">CHECK IN</div><h2>Body measurements</h2><p class="small muted">Optional. Record under similar conditions and use trends, not a single reading.</p><label class="label">Weight · kg<input id="bodyWeight" type="number" min="1" step="0.1" placeholder="86.5"></label><p><label class="label">Waist · cm (optional)<input id="bodyWaist" type="number" min="1" step="0.1" placeholder="81.3"></label></p><button class="primary" id="save-measure">Save check-in</button><div class="divider"></div>${m.slice(0,5).map(x=>`<p class="small">${esc(new Date(x.date).toLocaleDateString())} · <strong>${esc(x.weight)} kg</strong>${x.waist?' · '+esc(x.waist)+' cm':''}</p>`).join('')||'<p class="muted small">No check-ins yet.</p>'}</section></div></div>`}
const muscleGroups={'Biceps':/biceps|brachialis|brachioradialis/i,'Triceps':/triceps/i,'Chest':/chest|pectoral/i,'Shoulders':/shoulder|deltoid|rotator cuff/i,'Back':/back|lats|latissimus|rhomboid|trapezius|traps|erector spinae/i,'Abdominals & core':/abdominal|abs|oblique|core|trunk/i,'Quadriceps':/quad/i,'Hamstrings':/hamstring/i,'Glutes':/glute/i,'Calves':/calves|gastrocnemius|soleus/i,'Forearms':/forearm|brachioradialis/i,'Hips':/hip|abductor|adductor/i,'Full body':/full body/i};
function muscleText(e){return [e[2],...(e.meta?.primaryMuscles||[]),...(e.meta?.secondaryMuscles||[])].join(' ')}
// Editorial ranking: familiar foundational movements first, then alphabetical variants.
const popularByMuscle={
 'Biceps':['dumbbell bicep curl','barbell curl','hammer curl','preacher curl','incline dumbbell curl','biceps curl','bicep curl'],
 'Triceps':['triceps pushdown','triceps pushdowns','triceps extension','skullcrusher','dip'],
 'Chest':['bench press','chest press','incline dumbbell press','incline bench press','push-up','chest fly'],
 'Shoulders':['shoulder press','lateral raise','overhead press','rear delt','face pull'],
 'Back':['lat pulldown','pull-up','seated cable row','barbell row','chest-supported row','deadlift'],
 'Abdominals & core':['plank','dead bug','crunch','pallof press','leg raise'],
 'Quadriceps':['leg press','hack squat','squat','leg extension','pendulum squat','belt squat','lunge'],
 'Hamstrings':['romanian deadlift','leg curl','stiff-leg','good morning'],
 'Glutes':['hip thrust','squat','romanian deadlift','glute bridge','kickback'],
 'Calves':['calf raise','calf press'],
 'Forearms':['hammer curl','wrist curl','farmer'],
 'Hips':['hip abductor','hip adductor','abduction','adduction'],
 'Full body':['squat','deadlift','burpee','clean']};
const popularGeneral=['squat','bench press','leg press','hack squat','lat pulldown','shoulder press','cable row','deadlift','biceps curl','triceps pushdown','leg curl','leg extension','hip thrust','calf raise','plank'];
function rankExercise(id){const name=exercises[id][0].toLowerCase(), list=popularByMuscle[libraryMuscle]||popularGeneral;const index=list.findIndex(term=>name.includes(term));return index<0?1000:index*10+(name.startsWith(list[index])?0:2)+(name.length>55?1:0)}
function library(){
 const ids=Object.keys(exercises).filter(id=>{const e=exercises[id],m=e.meta||{},hay=[e[0],e[2],m.equipment,m.category,...(m.secondaryMuscles||[])].join(' ').toLowerCase();return hay.includes(librarySearch.toLowerCase())&&(!libraryMuscle||muscleGroups[libraryMuscle]?.test(muscleText(e)))&&(!libraryEquipment||(m.equipment||'other')===libraryEquipment)&&(!libraryCategory||(m.category||'strength')===libraryCategory)}).sort((a,b)=>rankExercise(a)-rankExercise(b)||exercises[a][0].localeCompare(exercises[b][0]));
 const all=Object.values(exercises),muscles=Object.keys(muscleGroups),equipment=[...new Set(all.map(e=>e.meta?.equipment||'other'))].sort(),categories=[...new Set(all.map(e=>e.meta?.category||'strength'))].sort();
 const options=(values,selected)=>values.map(x=>`<option value="${esc(x)}" ${x===selected?'selected':''}>${esc(x)}</option>`).join('');
 const totalPages=Math.max(1,Math.ceil(ids.length/24));libraryPage=Math.min(libraryPage,totalPages-1);
 return `<section class="card"><div class="section-head"><div><div class="eyebrow">THE MOVEMENT INDEX</div><h2>Exercise library</h2></div><span class="muted small">${ids.length} of ${all.length} movements</span></div><p class="muted">Browse familiar movements first, then explore more variations. Filter by muscle, equipment or type, and open an exercise to add it to a session.</p><div class="library-filters"><label>Search<input id="library-search" type="search" placeholder="Search exercises or muscles" value="${esc(librarySearch)}"></label><label>Muscle<select id="library-muscle"><option value="">All muscles</option>${options(muscles,libraryMuscle)}</select></label><label>Equipment<select id="library-equipment"><option value="">All equipment</option>${options(equipment,libraryEquipment)}</select></label><label>Type<select id="library-category"><option value="">All types</option>${options(categories,libraryCategory)}</select></label></div><details class="custom-builder"><summary>Can’t find a machine or exercise? Create your own</summary><form id="custom-exercise"><div class="library-filters"><label>Exercise name<input name="name" required maxlength="100" placeholder="e.g. Pendulum squat"></label><label>Primary muscle<input name="muscle" required maxlength="60" placeholder="e.g. quadriceps"></label><label>Equipment<input name="equipment" maxlength="60" placeholder="e.g. plate-loaded machine"></label><label>Technique note<input name="instruction" maxlength="300" placeholder="Optional"></label></div><button class="primary" type="submit">Save custom exercise</button></form></details><div class="library">${ids.slice(libraryPage*24,libraryPage*24+24).map(id=>{let e=exercises[id],m=e.meta||{};return `<article class="lib">${imageMarkup(id)}<div class="target">${esc(e[2])}</div><h3>${esc(e[0])}</h3><p class="small muted">${esc(m.equipment||'Programme exercise')} · ${esc(m.category||'strength')}</p><details><summary>Exercise details &amp; add</summary><p class="small muted">${esc(m.level||'')}${m.secondaryMuscles?.length?' · Also: '+esc(m.secondaryMuscles.join(', ')):''}</p>${m.instructions?.length?`<ol class="small">${m.instructions.map(x=>`<li>${esc(x)}</li>`).join('')}</ol>`:`<p class="small">${esc(e[3])}</p>`}<div class="actions session-add">${['A','B','C'].map(t=>`<button class="secondary" data-plan-add="${esc(id)}" data-session="${t}" ${plans[t].includes(id)?'disabled':''}>${plans[t].includes(id)?'Added to':'Add to'} ${t}</button>`).join('')}</div></details></article>`}).join('')||'<div class="empty">No exercises match those filters.</div>'}</div><div class="library-paging"><button class="secondary" id="library-prev" ${libraryPage===0?'disabled':''}>Previous</button><span class="small muted">Page ${libraryPage+1} of ${totalPages}</span><button class="secondary" id="library-next" ${libraryPage>=totalPages-1?'disabled':''}>Next</button></div><p class="small muted">Additional exercise data: <a href="https://github.com/yuhonas/free-exercise-db" target="_blank" rel="noopener noreferrer">Free Exercise DB</a> (Unlicense) and <a href="https://github.com/Glowupp-app/open-exercisedb" target="_blank" rel="noopener noreferrer">Open ExerciseDB</a> (<a href="EXERCISE-DATA-LICENSE-MIT.txt" target="_blank" rel="noopener noreferrer">MIT license</a>). Some exercises do not yet have images. Images are still references, not animations; techniques and suitability vary.</p></section>`
}
function settings(){return `<div class="grid"><section class="card"><div class="eyebrow">LOCAL FIRST</div><h2>Take your data with you.</h2><p>Saved workouts and measurements sync to your account. Unfinished drafts stay only in this browser on this device. Export regular backups of workouts and measurements. Session templates and custom exercises are not included in exports yet.</p><div class="actions"><button class="primary" id="export">Export backup</button><label class="secondary">Restore backup<input id="restore" type="file" accept="application/json" class="hidden"></label></div><p class="small muted">Import adds records to your account after confirmation; importing twice creates duplicates.</p></section><section class="card"><div class="eyebrow">COMING LATER</div><h2>Apple Health</h2><p>Not connected. A future native iPhone app can request HealthKit permissions for specific data types. No health data is being accessed or shared here.</p><div class="divider"></div><h2>About the visuals</h2><p class="muted">Realistic exercise stills are included. Accurate animated movement demonstrations require verified motion assets and are not yet available.</p></section></div>`}
function render(){setTitle();$('#app').innerHTML=page==='today'?today():page==='history'?progress():page==='library'?library():settings();bind()}
function chart(){let id=$('#chartExercise').value,name=exercises[id][0],points=history().slice().reverse().map(w=>({date:w.date,values:(w.sets||[]).filter(s=>s.name===name&&Number.isFinite(Number(s.weight))).map(s=>Number(s.weight))})).filter(x=>x.values.length).map(x=>({date:x.date,value:Math.max(...x.values)}));if(!points.length){$('#chart').innerHTML='<div class="empty">Log this exercise to see your trend.</div>';return}let max=Math.max(...points.map(p=>p.value),1),coords=points.map((p,i)=>`${30+(points.length===1?200:i*400/(points.length-1))},${155-p.value/max*125}`).join(' ');$('#chart').innerHTML=`<svg class="chart" viewBox="0 0 460 180" role="img" aria-label="${esc(name)} trend: ${points.map(p=>p.value+' kg').join(', ')}"><line x1="30" y1="155" x2="430" y2="155" stroke="#d8e5db"/><polyline points="${coords}" fill="none" stroke="#df684d" stroke-width="3"/>${points.map((p,i)=>`<circle cx="${30+(points.length===1?200:i*400/(points.length-1))}" cy="${155-p.value/max*125}" r="5" fill="#df684d"><title>${esc(new Date(p.date).toLocaleDateString())}: ${p.value} kg</title></circle>`).join('')}</svg>`}
function bind(){
 document.querySelectorAll('[data-frame]').forEach(button=>button.onclick=()=>{const id=button.dataset.id,frame=button.dataset.frame,wrap=button.closest('.visual-pair'),pic=wrap.querySelector('img');pic.src=frame==='1'?img(id):'assets/'+exerciseSecondVisuals[id]+'.webp';pic.alt=exercises[id][0]+', position '+frame+' of 2, AI-generated illustration';wrap.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===button)))});

 if($('#custom-exercise'))$('#custom-exercise').onsubmit=addCustom;
 document.querySelectorAll('[data-plan-add]').forEach(b=>b.onclick=()=>changePlan(b.dataset.session,b.dataset.planAdd));
 document.querySelectorAll('[data-remove-exercise]').forEach(b=>b.onclick=()=>changePlan(tab,b.dataset.removeExercise,true));
 const search=$('#library-search');if(search)search.oninput=()=>{librarySearch=search.value;libraryPage=0;const cursor=search.selectionStart;render();const next=$('#library-search');next.focus();next.setSelectionRange(cursor,cursor)};
 for(const [selector,set] of [['#library-muscle',v=>libraryMuscle=v],['#library-equipment',v=>libraryEquipment=v],['#library-category',v=>libraryCategory=v]]){const el=$(selector);if(el)el.onchange=()=>{set(el.value);libraryPage=0;render()}}
 if($('#library-prev'))$('#library-prev').onclick=()=>{libraryPage--;render()};if($('#library-next'))$('#library-next').onclick=()=>{libraryPage++;render()};
document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>selectTab(b.dataset.tab));document.querySelectorAll('[data-field]').forEach(el=>el.oninput=()=>{draft.items[+el.dataset.i].sets[+el.dataset.j][el.dataset.field]=el.value;saveDraft()});document.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>{draft.items[+b.dataset.add].sets.push({weight:'',reps:''});saveDraft();render()});document.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{let [i,j]=b.dataset.remove.split(',').map(Number);draft.items[i].sets.splice(j,1);saveDraft();render()});if($('#finish'))$('#finish').onclick=finish;if($('#clear'))$('#clear').onclick=()=>{if(confirm('Clear this unfinished session?')){draft=newDraft(tab);saveDraft();render()}};if($('#timer'))$('#timer').onclick=()=>{if(timer){clearInterval(timer);timer=null;render();return}timer=setInterval(()=>{remaining--;if(remaining<=0){clearInterval(timer);timer=null;remaining=0;toast('Rest complete.');}if($('#clock'))$('#clock').textContent=Math.floor(remaining/60)+':'+String(remaining%60).padStart(2,'0');if(!timer&&$('#timer'))$('#timer').textContent='Start 90 sec'},1000);render()};if($('#reset-timer'))$('#reset-timer').onclick=()=>{clearInterval(timer);timer=null;remaining=90;render()};document.querySelectorAll('[data-delete]').forEach(b=>b.onclick=async()=>{if(confirm('Delete this workout permanently?')){try{await deleteCloud(history()[+b.dataset.delete]._id);render()}catch(e){alert('Could not delete workout. Please try again.')}}});if($('#chartExercise')){$('#chartExercise').onchange=chart;chart()}if($('#save-measure'))$('#save-measure').onclick=async()=>{let w=$('#bodyWeight').value,wa=$('#bodyWaist').value;if(!w||+w<=0||(wa&&+wa<=0)){alert('Enter a valid positive weight and waist.');return}try{await addCloud('measurement',{weight:w,waist:wa});toast('Check-in saved.');render()}catch(e){alert('Could not save check-in. Please retry.')}};if($('#export'))$('#export').onclick=exportBackup;if($('#restore'))$('#restore').onchange=restore}
async function finish(){let sets=[],invalid=false;for(let it of draft.items)for(let s of it.sets){if(s.weight===''&&s.reps==='')continue;if(s.weight===''||s.reps===''||!Number.isFinite(+s.weight)||+s.weight<0||!Number.isInteger(+s.reps)||+s.reps<1){invalid=true;continue}sets.push({name:exercises[it.id][0],weight:s.weight,reps:s.reps})}if(invalid){alert('Complete each started set with a valid weight and whole-number repetitions, or clear both fields.');return}if(!sets.length){alert('Enter at least one set to save a workout.');return}try{await addCloud('workout',{workout:`Session ${tab}`,sets});draft=newDraft(tab);saveDraft();toast('Workout saved to your account.');render()}catch(e){alert('Could not save workout. Your draft remains on this device. Please retry.')}}
function exportBackup(){let data={version:2,workouts:history(),measurements:measurements()};let url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));let a=document.createElement('a');a.href=url;a.download='stronger-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}async function restore(e){let f=e.target.files[0];if(!f)return;try{let data=JSON.parse(await f.text()),h=Array.isArray(data)?data:data.workouts,m=Array.isArray(data)?[]:data.measurements;if(!Array.isArray(h)||!Array.isArray(m)||!h.every(w=>w&&typeof w.date==='string'&&!isNaN(Date.parse(w.date))&&typeof w.workout==='string'&&Array.isArray(w.sets)&&w.sets.every(s=>s&&typeof s.name==='string'&&s.weight!==''&&s.reps!==''&&Number.isFinite(+s.weight)&&+s.weight>=0&&Number.isInteger(+s.reps)&&+s.reps>0))||!m.every(x=>x&&typeof x.date==='string'&&!isNaN(Date.parse(x.date))&&Number.isFinite(+x.weight)&&+x.weight>0&&(!x.waist||(Number.isFinite(+x.waist)&&+x.waist>0))))throw Error('invalid');if(!confirm('Import these workouts and measurements into your account? Existing entries are kept. Importing the same file twice creates duplicates.'))return;let rows=[...h.map(w=>({kind:'workout',occurred_at:w.date,payload:{workout:w.workout,sets:w.sets}})),...m.map(x=>({kind:'measurement',occurred_at:x.date,payload:{weight:x.weight,waist:x.waist||''}}))];if(rows.length){let {data,error}=await window.gymBackend.from('gym_records').insert(rows).select('id,kind,occurred_at,payload');if(error)throw error;cloudRows=cloudRows.concat(data).sort((a,b)=>b.occurred_at.localeCompare(a.occurred_at))}toast('Backup imported.');render()}catch(error){alert('Import failed. Verify the backup and your connection; please try again.')}finally{e.target.value=''}}
window.startGym=async user=>{currentUser=user;draft=null;await Promise.all([refreshCloud(),loadPlans()]);render()};
window.stopGym=()=>{currentUser=null;cloudRows=[];draft=null;for(const e of customExercises)delete exercises[e.id];customExercises=[];plans=structuredClone(defaultPlans);document.querySelector('#app').innerHTML=''};

