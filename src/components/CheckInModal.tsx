/**
 * @module CheckInModal
 * @description Daily wellness check-in modal with mood, stress, sleep, and study tracking.
 * @accessibility All sliders have ARIA labels, fieldsets group related inputs.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useSubmitCheckIn } from "@/hooks/useCheckIn";
import { MOOD_OPTIONS, MOOD_EMOJIS, type MoodOption } from "@/types";

interface CheckInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CheckInModal({ open, onOpenChange }: CheckInModalProps) {
  const [mood, setMood] = useState<MoodOption>("Okay");
  const [stressScore, setStressScore] = useState(5);
  const [energyScore, setEnergyScore] = useState(5);
  const [sleepHours, setSleepHours] = useState(7);
  const [studyHours, setStudyHours] = useState(4);
  const [confidenceLevel, setConfidenceLevel] = useState(5);
  const [reflectionNote, setReflectionNote] = useState("");

  const submitMutation = useSubmitCheckIn();

  async function handleSubmit() {
    try {
      const result = await submitMutation.mutateAsync({
        mood, stressScore, energyScore, sleepHours, studyHours, confidenceLevel, reflectionNote,
      });
      toast.success(`Check-in saved! Wellness score: ${result.score}`);
      onOpenChange(false);
    } catch (error: any) {
      console.error("[CheckIn Error]", error);
      toast.error(error?.message || "Failed to save check-in. Please try again.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="glass max-h-[90vh] overflow-y-auto sm:max-w-lg"
        aria-label="Daily wellness check-in form"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Daily Check-In</DialogTitle>
          <DialogDescription>How are you feeling today? Be honest — this is your safe space.</DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          {/* Mood */}
          <fieldset>
            <legend className="mb-3 text-sm font-medium">How's your mood?</legend>
            <div className="flex flex-wrap gap-2">
              {MOOD_OPTIONS.map((m) => (
                <button
                  key={m}
                  onClick={() => setMood(m)}
                  aria-pressed={mood === m}
                  aria-label={`Select mood: ${m}`}
                  className={`flex flex-col items-center gap-1 rounded-2xl border px-4 py-3 transition-all ${
                    mood === m
                      ? "border-primary bg-card shadow-[var(--shadow-glow)] -translate-y-0.5"
                      : "border-transparent bg-muted/50 hover:border-border"
                  }`}
                >
                  <span className="text-2xl">{MOOD_EMOJIS[m]}</span>
                  <span className="text-xs font-medium">{m}</span>
                </button>
              ))}
            </div>
          </fieldset>

          {/* Stress */}
          <div>
            <Label htmlFor="stress-slider">Stress Level: {stressScore}/10</Label>
            <Slider
              id="stress-slider"
              min={1} max={10} step={1}
              value={[stressScore]}
              onValueChange={([v]) => setStressScore(v)}
              aria-label={`Stress level: ${stressScore} out of 10`}
              className="mt-2"
            />
          </div>

          {/* Energy */}
          <div>
            <Label htmlFor="energy-slider">Energy Level: {energyScore}/10</Label>
            <Slider
              id="energy-slider"
              min={1} max={10} step={1}
              value={[energyScore]}
              onValueChange={([v]) => setEnergyScore(v)}
              aria-label={`Energy level: ${energyScore} out of 10`}
              className="mt-2"
            />
          </div>

          {/* Sleep & Study */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sleep-input">Sleep (hours)</Label>
              <Input
                id="sleep-input"
                type="number" min={0} max={24} step={0.5}
                value={sleepHours}
                onChange={(e) => setSleepHours(parseFloat(e.target.value) || 0)}
                aria-label="Hours of sleep"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="study-input">Study (hours)</Label>
              <Input
                id="study-input"
                type="number" min={0} max={24} step={0.5}
                value={studyHours}
                onChange={(e) => setStudyHours(parseFloat(e.target.value) || 0)}
                aria-label="Hours of study"
                className="mt-1"
              />
            </div>
          </div>

          {/* Confidence */}
          <div>
            <Label htmlFor="confidence-slider">Confidence Level: {confidenceLevel}/10</Label>
            <Slider
              id="confidence-slider"
              min={1} max={10} step={1}
              value={[confidenceLevel]}
              onValueChange={([v]) => setConfidenceLevel(v)}
              aria-label={`Confidence level: ${confidenceLevel} out of 10`}
              className="mt-2"
            />
          </div>

          {/* Reflection */}
          <div>
            <Label htmlFor="reflection-note">Quick reflection (optional)</Label>
            <Textarea
              id="reflection-note"
              value={reflectionNote}
              onChange={(e) => setReflectionNote(e.target.value)}
              placeholder="What's on your mind today?"
              rows={3}
              aria-label="Reflection note"
              className="mt-1"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={submitMutation.isPending}
            className="w-full rounded-full bg-gradient-to-r from-primary to-[color:var(--lavender)] py-3 text-primary-foreground"
            aria-label="Submit daily check-in"
          >
            {submitMutation.isPending ? "Saving..." : "Save check-in ✨"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
