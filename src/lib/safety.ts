/**
 * @module safety
 * @description Crisis detection and safety system for MindMate AI.
 * Detects phrases indicating self-harm or crisis in user input
 * and provides appropriate crisis resources.
 *
 * @important This is NOT a clinical tool. It is a first-line detection
 * system that encourages users to seek professional help.
 *
 * @security All safety events are logged to Firestore for audit.
 * No user content is shared externally — only the fact that a trigger occurred.
 */

// ─── Crisis Phrases ───────────────────────────────────────────────────────────

/**
 * Phrases that indicate potential crisis.
 * Kept lowercase for case-insensitive matching.
 * Order: most specific first to avoid false positives.
 */
const CRISIS_PHRASES = [
  "self harm",
  "self-harm",
  "selfharm",
  "suicide",
  "suicidal",
  "kill myself",
  "killing myself",
  "hurting myself",
  "hurt myself",
  "end my life",
  "ending my life",
  "end it all",
  "don't want to live",
  "dont want to live",
  "don't want to be alive",
  "life not worth living",
  "life is not worth",
  "not worth living",
  "want to die",
  "wanna die",
  "better off dead",
  "no reason to live",
  "hopeless",
  "give up on life",
  "can't go on",
  "cant go on",
  "nothing to live for",
] as const;

// ─── Crisis Resources ─────────────────────────────────────────────────────────

/** Emergency helpline numbers and resources for India */
export const CRISIS_RESOURCES = {
  helplines: [
    {
      name: "iCall",
      number: "9152987821",
      description: "Free counseling by trained professionals (Mon–Sat, 8am–10pm)",
    },
    {
      name: "Vandrevala Foundation",
      number: "1860-2662-345",
      description: "24/7 free mental health helpline",
    },
    {
      name: "AASRA",
      number: "9820466726",
      description: "24/7 crisis intervention center",
    },
    {
      name: "Snehi",
      number: "044-24640050",
      description: "Emotional support and suicide prevention",
    },
  ],
  message: `I can see you're going through something really difficult right now, and I want you to know — you're not alone in this.

What you're feeling matters, and you deserve support from someone who can truly help.

Please reach out to one of these trained professionals:

📞 **iCall**: 9152987821 (Mon–Sat, 8am–10pm)
📞 **Vandrevala Foundation**: 1860-2662-345 (24/7)
📞 **AASRA**: 9820466726 (24/7)

You can also talk to a trusted adult — a parent, teacher, or school counselor.

I'm here for you, but this is something a real person can help with better than I can. 💛`,
} as const;

// ─── Detection Function ───────────────────────────────────────────────────────

export interface SafetyCheckResult {
  /** Whether a crisis phrase was detected */
  isCrisis: boolean;
  /** The specific phrase that triggered detection, or `null` */
  triggerPhrase: string | null;
  /** The crisis response message, or `null` if no crisis */
  responseMessage: string | null;
}

/**
 * Checks user input for crisis indicators.
 * Uses simple substring matching — intentionally broad to err on the
 * side of caution. False positives are preferable to false negatives.
 *
 * @param input - The user's message text
 * @returns Detection result with trigger details
 *
 * @example
 * ```ts
 * const result = detectCrisis("I feel hopeless about everything");
 * if (result.isCrisis) {
 *   showCrisisModal(result.responseMessage);
 *   logSafetyEvent(userId, result.triggerPhrase);
 * }
 * ```
 */
export function detectCrisis(input: string): SafetyCheckResult {
  const normalized = input.toLowerCase().trim();

  for (const phrase of CRISIS_PHRASES) {
    if (normalized.includes(phrase)) {
      return {
        isCrisis: true,
        triggerPhrase: phrase,
        responseMessage: CRISIS_RESOURCES.message,
      };
    }
  }

  return {
    isCrisis: false,
    triggerPhrase: null,
    responseMessage: null,
  };
}

/**
 * Generates the system prompt addendum for the AI coach when crisis
 * is detected. This overrides normal coaching behavior.
 */
export function getCrisisSystemPrompt(): string {
  return `CRITICAL SAFETY OVERRIDE: The student has expressed thoughts of self-harm or crisis.

DO NOT continue normal coaching. Instead:
1. Acknowledge their pain with genuine empathy
2. Do NOT minimize their feelings or offer generic advice
3. Clearly state that professional support is available
4. Provide these helpline numbers:
   - iCall: 9152987821
   - Vandrevala Foundation: 1860-2662-345 (24/7)
   - AASRA: 9820466726 (24/7)
   - Snehi: 044-24640050
5. Encourage them to speak with a trusted adult (parent, teacher, counselor)
6. Remind them that seeking help is a sign of strength
7. Keep your response warm, brief, and focused on connecting them with help`;
}
