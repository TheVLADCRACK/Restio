// Placé sous le titre (pas de surtitre) : la barre est décorative, le texte porte l'information.
export function StepIndicator({ step, total }: { step: number; total: number }) {
  return (
    <div className="mb-6 grid gap-2">
      <div aria-hidden="true" className="flex gap-1.5">
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={`h-1.5 flex-1 rounded-full ${i < step ? 'bg-ink' : 'bg-sunken'}`} />
        ))}
      </div>
      <p className="text-sm font-medium text-text-2">
        Étape {step} sur {total}
      </p>
    </div>
  );
}
