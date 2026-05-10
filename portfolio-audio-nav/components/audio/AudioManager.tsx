'use client'

import React, { useEffect } from 'react'
import MuteToggle from './MuteToggle'
import { getMuted, setMuted } from '@/lib/audio'

export default function AudioManager() {
  useEffect(() => {
    const savedMuted = getMuted()
    console.log('AudioManager initialized, muted:', savedMuted)
  }, [])

  return <MuteToggle position="top-right" />
}