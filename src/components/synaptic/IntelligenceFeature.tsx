import Image from 'next/image'
import Link from 'next/link'
import styles from './IntelligenceFeature.module.css'

export function IntelligenceFeature(){
 return <Link href="/synaptic/intelligence-without-permission" className={styles.card} aria-label="Read Intelligence Without Permission, a 40,000-word Synaptic essay with 38 figures and 10 interactive 3D laboratories">
  <Image src="/synaptic/intelligence-without-permission/editorial-cover.webp" alt="Conceptual sculpture: a transparent research chamber opens into a widening lattice of light." fill sizes="(min-width: 1280px) 1200px, 100vw" className={styles.art}/>
  <div className={styles.scrim}/><div className={styles.content}><div className={styles.eyebrow}><span>Synaptic / The new research order</span><span>September 2026</span></div><div className={styles.body}><span className={styles.kicker}>The end of intellectual exclusivity</span><h3>Intelligence<br/>Without<br/><em>Permission.</em></h3><p>When PhD-level work becomes widely accessible, what happens to the institutions that built their power around its scarcity?</p><span className={styles.enter}>Enter the essay <b aria-hidden="true">↗</b></span></div><div className={styles.footer}><span><strong>40,000+</strong>words</span><span><strong>38</strong>visual studies</span><span><strong>10</strong>3D laboratories</span><span><strong>05</strong>industries in transition</span></div></div>
 </Link>
}
