'use strict';
// Fame per refined material: T4..T8, enchantment .0; each enchantment doubles fame.
const MATERIAL_FAME={4:22.5,5:90,6:270,7:645,8:1395};
// Standard item recipes: helmet/shoes/offhand/cape = 8, chest/bag = 16.
const DEFAULT_MATS={helmet:8,shoes:8,chest:16,offhand:8,bag:16};
const $=id=>document.getElementById(id);
const number=id=>Number($(id).value);
const fmt=n=>new Intl.NumberFormat('en-US',{maximumFractionDigits:2}).format(n);
let lastResult='';
function syncRecipe(){ $('mats').value=DEFAULT_MATS[$('kind').value]; calculate(); }
function calculate(){
 const tier=number('tier'), enchant=number('enchant'), qty=number('mats');
 const needed=number('needed'), premium=number('premium'), price=number('price');
 const rrr=number('rrr'), fee=number('fee'), sell=number('sell'), tax=number('tax');
 if([qty,needed,premium,price,rrr,fee,sell,tax].some(n=>!Number.isFinite(n)||n<0)||qty<=0||rrr>=100||tax>100){$('details').textContent='กรุณากรอกตัวเลขให้ถูกต้อง (RRR ต้องน้อยกว่า 100%)';return;}
 const base=MATERIAL_FAME[tier]*Math.pow(2,enchant)*qty;
 const craftFame=base*(1+premium/100);
 const study=$('study').checked;
 // Study grants 275% of base fame, multiplied here by the user-supplied fame bonus.
 // Special study modifiers and artifact factors are not included.
 const studyFame=study?base*2.75*(1+premium/100):0;
 const perItem=craftFame+studyFame;
 const count=Math.ceil(needed/perItem);
 const gross=count*qty;
 // Expected net consumption across a large batch, not a guaranteed purchase quantity.
 const net=gross*(1-rrr/100);
 const expense=net*price+count*fee;
 const proceeds=study?0:count*sell*(1-tax/100);
 const netCost=expense-proceeds;
 $('count').textContent=fmt(count);$('fame').textContent=fmt(perItem);$('materials').textContent=fmt(net);$('cost').textContent=fmt(netCost);
 const item=$('item').value.trim()||$('kind').selectedOptions[0].text;
 const lines=[`ไอเทม: ${item} T${tier}.${enchant}`,`ต้องคราฟ: ${fmt(count)} ชิ้น`,`Craft Fame ต่อชิ้น: ${fmt(craftFame)}`,`Study Fame ต่อชิ้น: ${fmt(studyFame)}`,`Fame รวม: ${fmt(count*perItem)}`,`วัตถุดิบก่อนคืน: ${fmt(gross)} หน่วย`,`วัตถุดิบสุทธิโดยประมาณ: ${fmt(net)} หน่วย`,`ต้นทุนวัตถุดิบ + สถานี: ${fmt(expense)} Silver`,`รายรับหลังภาษี: ${fmt(proceeds)} Silver`,`ต้นทุนสุทธิ: ${fmt(netCost)} Silver`];
 lastResult=lines.join('\n');
 $('details').innerHTML='';
 lines.forEach(line=>{const div=document.createElement('div');div.textContent=line;$('details').appendChild(div)});
 const note=document.createElement('p');note.className='hint';note.textContent='หมายเหตุ: Resource Return Rate เป็นค่าเฉลี่ยโดยประมาณ ไม่ใช่การรับประกันจำนวนคืนต่อครั้ง และไม่ได้คิดการวนใช้วัสดุคืนซ้ำจนหมด รวมถึงไม่รองรับสูตร Artifact/ไอเทมพิเศษอัตโนมัติ';$('details').appendChild(note);
}
$('kind').addEventListener('change',syncRecipe);
$('calculate').addEventListener('click',calculate);
$('copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(lastResult);$('copy').textContent='คัดลอกแล้ว ✓';setTimeout(()=>$('copy').textContent='คัดลอกผลลัพธ์',1400)}catch{alert('คัดลอกไม่ได้ กรุณาเลือกข้อความจากผลลัพธ์')}});
calculate();
