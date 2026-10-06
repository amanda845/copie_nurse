import { reactive, computed } from 'vue'

export const initialRoomsData = {
  womenRooms: [
    {
      id: 'F01',
      name: 'Chambre F01',
      capacity: 4,
      beds: [
        { id: 'F01-1', bedNum: 1, status: 'Libre', patient: null },
        { id: 'F01-2', bedNum: 2, status: 'Occupé', patient: { id: 'DEM-2026-002', name: 'Sarah Benali', age: 34, diagnosis: 'Suivi post-opératoire', entryDate: '02/04/2026', doctor: 'Dr. Meziane' } },
        { id: 'F01-3', bedNum: 3, status: 'Libre', patient: null },
        { id: 'F01-4', bedNum: 4, status: 'Réservé', reservedFor: 'Arrivée programmée (Chirurgie B) - 14:00' }
      ]
    },
    {
      id: 'F02',
      name: 'Chambre F02',
      capacity: 4,
      beds: [
        { id: 'F02-1', bedNum: 1, status: 'Libre', patient: null },
        { id: 'F02-2', bedNum: 2, status: 'Libre', patient: null },
        { id: 'F02-3', bedNum: 3, status: 'Occupé', patient: { id: 'DEM-2026-004', name: 'Nadia Cherif', age: 46, diagnosis: 'Diabète type 2 déséquilibré', entryDate: '01/04/2026', doctor: 'Dr. Touati' } },
        { id: 'F02-4', bedNum: 4, status: 'Libre', patient: null }
      ]
    },
    {
      id: 'F03',
      name: 'Chambre F03',
      capacity: 4,
      beds: [
        { id: 'F03-1', bedNum: 1, status: 'Occupé', patient: { id: 'DEM-2026-005', name: 'Lina Haddad', age: 62, diagnosis: 'Insuffisance respiratoire aiguë', entryDate: '03/04/2026', doctor: 'Dr. Amrani' } },
        { id: 'F03-2', bedNum: 2, status: 'Libre', patient: null },
        { id: 'F03-3', bedNum: 3, status: 'Réservé', reservedFor: 'Transfert réanimation médicale - 11:30' },
        { id: 'F03-4', bedNum: 4, status: 'Libre', patient: null }
      ]
    },
    {
      id: 'F04',
      name: 'Chambre F04',
      capacity: 4,
      beds: [
        { id: 'F04-1', bedNum: 1, status: 'Libre', patient: null },
        { id: 'F04-2', bedNum: 2, status: 'Occupé', patient: { id: 'DEM-2026-008', name: 'Fatima Zahra Oukaci', age: 44, diagnosis: 'Hypertension artérielle maligne', entryDate: '04/04/2026', doctor: 'Dr. Meziane' } },
        { id: 'F04-3', bedNum: 3, status: 'Libre', patient: null },
        { id: 'F04-4', bedNum: 4, status: 'Libre', patient: null }
      ]
    }
  ],

  menRooms: [
    {
      id: 'H01',
      name: 'Chambre H01',
      capacity: 4,
      beds: [
        { id: 'H01-1', bedNum: 1, status: 'Libre', patient: null },
        { id: 'H01-2', bedNum: 2, status: 'Libre', patient: null },
        { id: 'H01-3', bedNum: 3, status: 'Occupé', patient: { id: 'DEM-2026-001', name: 'Amine Mansouri', age: 27, diagnosis: 'Surveillance et bilan clinique', entryDate: '03/04/2026', doctor: 'Dr. Meziane' } },
        { id: 'H01-4', bedNum: 4, status: 'Libre', patient: null }
      ]
    },
    {
      id: 'H02',
      name: 'Chambre H02',
      capacity: 4,
      beds: [
        { id: 'H02-1', bedNum: 1, status: 'Occupé', patient: { id: 'DEM-2026-003', name: 'Yacine Aït', age: 52, diagnosis: 'Syndrome coronarien aigu (stabilisé)', entryDate: '04/04/2026', doctor: 'Dr. Touati' } },
        { id: 'H02-2', bedNum: 2, status: 'Occupé', patient: { id: 'DEM-2026-006', name: 'Omar Meziane', age: 39, diagnosis: 'Bilan hépatique (Sortie prévue)', entryDate: '30/03/2026', doctor: 'Dr. Amrani' } },
        { id: 'H02-3', bedNum: 3, status: 'Libre', patient: null },
        { id: 'H02-4', bedNum: 4, status: 'Réservé', reservedFor: 'Arrivée SAU Urgences - 16:00' }
      ]
    },
    {
      id: 'H03',
      name: 'Chambre H03',
      capacity: 4,
      beds: [
        { id: 'H03-1', bedNum: 1, status: 'Libre', patient: null },
        { id: 'H03-2', bedNum: 2, status: 'Libre', patient: null },
        { id: 'H03-3', bedNum: 3, status: 'Occupé', patient: { id: 'DEM-2026-007', name: 'Khalid Benmoussa', age: 58, diagnosis: 'Pneumopathie infectieuse', entryDate: '02/04/2026', doctor: 'Dr. Touati' } },
        { id: 'H03-4', bedNum: 4, status: 'Libre', patient: null }
      ]
    },
    {
      id: 'H04',
      name: 'Chambre H04',
      capacity: 4,
      beds: [
        { id: 'H04-1', bedNum: 1, status: 'Libre', patient: null },
        { id: 'H04-2', bedNum: 2, status: 'Libre', patient: null },
        { id: 'H04-3', bedNum: 3, status: 'Libre', patient: null },
        { id: 'H04-4', bedNum: 4, status: 'Occupé', patient: { id: 'DEM-2026-009', name: 'Karim Brahimi', age: 48, diagnosis: 'Bilan métabolique complet', entryDate: '04/04/2026', doctor: 'Dr. Meziane' } }
      ]
    }
  ],

  // Hôpital de jour : Rendez-vous & Séances ambulatoires du jour (SANS NUITÉE)
  // Le patient vient pour son soin/séance et repart dormir chez lui.
  dayHospitalSessions: [
    {
      id: 'HDJ-RDV-01',
      slot: '08:30 – 11:30',
      period: 'Matin',
      chair: 'Fauteuil A1',
      patient: {
        id: 'HDJ-2026-001',
        name: 'Rachid Boumediène',
        age: 55,
        diagnosis: 'Séance de chimiothérapie (Protocole FOLFOX, Cure J1)',
        doctor: 'Dr. Meziane',
        nurse: 'Inf. Sarah',
        arrivalTime: '08:20',
        departureTime: '11:45 (estimée)',
        returnHome: true
      },
      careType: 'Chimiothérapie ambulatoire',
      status: 'En soin', // 'En soin' | 'Prévu' | 'Terminé'
      notes: 'Pose de perfusion sur chambre implantable (PAC). Constantes stables, collation prise.'
    },
    {
      id: 'HDJ-RDV-02',
      slot: '09:15 – 12:15',
      period: 'Matin',
      chair: 'Fauteuil A2',
      patient: {
        id: 'HDJ-2026-002',
        name: 'Meriem Taleb',
        age: 38,
        diagnosis: 'Transfusion sanguine ambulatoire (Anémie chronique)',
        doctor: 'Dr. Touati',
        nurse: 'Inf. Amel',
        arrivalTime: '09:05',
        departureTime: '12:30 (estimée)',
        returnHome: true
      },
      careType: 'Transfusion sanguine ambulatoire',
      status: 'En soin',
      notes: 'Contrôle ultime pré-transfusionnel au lit du malade conforme. 1er CGR en cours.'
    },
    {
      id: 'HDJ-RDV-03',
      slot: '08:00 – 10:00',
      period: 'Matin',
      chair: 'Fauteuil B1',
      patient: {
        id: 'HDJ-2026-003',
        name: 'Sofiane Khellaf',
        age: 47,
        diagnosis: 'Perfusion de fer injectable (Venofer 200mg)',
        doctor: 'Dr. Meziane',
        nurse: 'Inf. Nadia',
        arrivalTime: '07:55',
        departureTime: '10:15 (Sortie effectuée)',
        returnHome: true
      },
      careType: 'Perfusion fer injectable',
      status: 'Terminé',
      notes: 'Séance terminée sans incident ni allergie. Constantes de sortie normales. Patient rentré à son domicile.'
    },
    {
      id: 'HDJ-RDV-04',
      slot: '13:30 – 15:30',
      period: 'Après-midi',
      chair: 'Fauteuil B2',
      patient: {
        id: 'HDJ-2026-004',
        name: 'Yasmine Belkacem',
        age: 29,
        diagnosis: 'Biothérapie sous-cutanée & Évaluation clinique',
        doctor: 'Dr. Amrani',
        nurse: 'Inf. Sarah',
        arrivalTime: 'Attendu à 13h30',
        departureTime: '15:30 (estimée)',
        returnHome: true
      },
      careType: 'Biothérapie ambulatoire',
      status: 'Prévu',
      notes: 'Rendez-vous programmé en début d’après-midi. Bilan biologique à vérifier avant injection.'
    },
    {
      id: 'HDJ-RDV-05',
      slot: '14:00 – 16:30',
      period: 'Après-midi',
      chair: 'Poste C1',
      patient: {
        id: 'HDJ-2026-005',
        name: 'Abdelkader Saïdi',
        age: 63,
        diagnosis: 'Ponction d\'ascite exploratrice & Perfusion albumine',
        doctor: 'Dr. Touati',
        nurse: 'Inf. Amel',
        arrivalTime: 'Attendu à 14h00',
        departureTime: '17:00 (estimée)',
        returnHome: true
      },
      careType: 'Ponction & Perfusion ambulatoire',
      status: 'Prévu',
      notes: 'Patient convoqué à 14h00. Échoguidage prévu avec le médecin de garde.'
    },
    {
      id: 'HDJ-RDV-06',
      slot: '15:30 – 17:30',
      period: 'Après-midi',
      chair: 'Fauteuil C2',
      patient: {
        id: 'HDJ-2026-006',
        name: 'Fatma Mansouri',
        age: 52,
        diagnosis: 'Pansement complexe & contrôle post-opératoire ambulatoire',
        doctor: 'Dr. Meziane',
        nurse: 'Inf. Nadia',
        arrivalTime: 'Attendu à 15h30',
        departureTime: '17:30 (estimée)',
        returnHome: true
      },
      careType: 'Soins infirmiers ambulatoires',
      status: 'Prévu',
      notes: 'Séance de fin de journée pour réfection de pansement chirurgical avant retour au domicile.'
    }
  ],

  // Maintien d'une structure pour compatibilité
  dayHospitalBeds: [
    { id: 'HDJ-01', bedNum: 1, status: 'Occupé' },
    { id: 'HDJ-02', bedNum: 2, status: 'Occupé' },
    { id: 'HDJ-03', bedNum: 3, status: 'Libre' },
    { id: 'HDJ-04', bedNum: 4, status: 'Réservé' },
    { id: 'HDJ-05', bedNum: 5, status: 'Libre' },
    { id: 'HDJ-06', bedNum: 6, status: 'Libre' }
  ]
}

// Reactive store
export const roomsState = reactive(JSON.parse(JSON.stringify(initialRoomsData)))

// Statistics
export const roomsStats = computed(() => {
  let totalBeds = 0
  let freeBeds = 0
  let occupiedBeds = 0
  let reservedBeds = 0

  const countBeds = (bedList) => {
    bedList.forEach(b => {
      totalBeds++
      if (b.status === 'Libre') freeBeds++
      else if (b.status === 'Occupé') occupiedBeds++
      else if (b.status === 'Réservé') reservedBeds++
    })
  }

  roomsState.womenRooms.forEach(r => countBeds(r.beds))
  roomsState.menRooms.forEach(r => countBeds(r.beds))

  // Statistiques Hôpital de jour (Rendez-vous ambulatoires du jour)
  const hdjSessions = roomsState.dayHospitalSessions || []
  const hdjCount = hdjSessions.length
  const hdjInProgress = hdjSessions.filter(s => s.status === 'En soin').length
  const hdjFinished = hdjSessions.filter(s => s.status === 'Terminé').length
  const hdjUpcoming = hdjSessions.filter(s => s.status === 'Prévu').length

  return {
    womenRoomsCount: roomsState.womenRooms.length,
    menRoomsCount: roomsState.menRooms.length,
    dayHospitalCount: hdjCount,
    dayHospitalInProgress: hdjInProgress,
    dayHospitalFinished: hdjFinished,
    dayHospitalUpcoming: hdjUpcoming,
    totalBeds,
    freeBeds,
    occupiedBeds,
    reservedBeds
  }
})

// Action to update bed status in conventional rooms
export function setBedStatus(bedId, newStatus, patientData = null) {
  const findAndModify = (bedList) => {
    const bed = bedList.find(b => b.id === bedId)
    if (bed) {
      bed.status = newStatus
      if (newStatus === 'Libre') {
        bed.patient = null
        bed.reservedFor = null
      } else if (newStatus === 'Occupé' && patientData) {
        bed.patient = patientData
        bed.reservedFor = null
      } else if (newStatus === 'Réservé') {
        bed.patient = null
        bed.reservedFor = patientData?.reservedFor || 'Réservation programmée'
      }
      return true
    }
    return false
  }

  for (const r of roomsState.womenRooms) {
    if (findAndModify(r.beds)) return
  }
  for (const r of roomsState.menRooms) {
    if (findAndModify(r.beds)) return
  }
}

// Action to update Day Hospital ambulatory appointment status
export function setHdjSessionStatus(sessionId, newStatus) {
  const session = roomsState.dayHospitalSessions.find(s => s.id === sessionId)
  if (session) {
    session.status = newStatus
    if (newStatus === 'Terminé') {
      session.patient.departureTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' (Sortie effectuée - rentré chez lui)'
    } else if (newStatus === 'En soin') {
      session.patient.arrivalTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  }
}

// Action to add an ambulatory appointment
export function addHdjSession(newSession) {
  roomsState.dayHospitalSessions.push(newSession)
}

