'use client'

import { useEffect } from 'react'
import { retenirProvenance } from '../lib/provenance'

// D'où vient le visiteur, retenu dès la première page (voir lib/provenance).
export default function ProvenanceCapture() {
  useEffect(() => { retenirProvenance() }, [])
  return null
}
