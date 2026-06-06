/** @module CrisisModal — Emergency support modal for detected crisis phrases */
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader,
  AlertDialogTitle, AlertDialogDescription, AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Phone, Heart } from "lucide-react";
import { CRISIS_RESOURCES } from "@/lib/safety";

interface CrisisModalProps {
  open: boolean;
  onAcknowledge: () => void;
}

export function CrisisModal({ open, onAcknowledge }: CrisisModalProps) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent
        className="glass max-w-lg"
        role="alertdialog"
        aria-label="Crisis support resources"
      >
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 font-display text-xl">
            <Heart className="h-5 w-5 text-primary" aria-hidden="true" />
            We're here for you
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left text-sm leading-relaxed">
            It sounds like you might be going through something really tough right now.
            You're not alone, and there are people who can help.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="my-4 space-y-3" role="list" aria-label="Crisis helpline numbers">
          {CRISIS_RESOURCES.helplines.map((h) => (
            <a
              key={h.number}
              href={`tel:${h.number.replace(/-/g, "")}`}
              role="listitem"
              className="flex items-center gap-3 rounded-2xl bg-muted/50 p-3 transition-colors hover:bg-card"
              aria-label={`Call ${h.name} at ${h.number}`}
            >
              <span className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
                <Phone className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <div className="text-sm font-medium">{h.name}</div>
                <div className="text-xs text-muted-foreground">{h.number} — {h.description}</div>
              </div>
            </a>
          ))}
        </div>

        <p className="text-xs text-muted-foreground">
          You can also talk to a trusted adult — a parent, teacher, or school counselor.
          Seeking help is a sign of strength. 💛
        </p>

        <AlertDialogFooter>
          <AlertDialogAction
            onClick={onAcknowledge}
            className="w-full rounded-full"
            aria-label="I understand and acknowledge crisis resources"
          >
            I understand
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
