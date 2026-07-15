import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-[#050a0a]/90 group-[.toaster]:backdrop-blur-2xl group-[.toaster]:text-white group-[.toaster]:border-white/10 group-[.toaster]:shadow-[0_8px_30px_rgb(0,0,0,0.5)] group-[.toaster]:rounded-2xl",
          description: "group-[.toast]:text-white/60",
          actionButton: "group-[.toast]:bg-emerald-500 group-[.toast]:text-[#030808] group-[.toast]:font-semibold",
          cancelButton: "group-[.toast]:bg-white/5 group-[.toast]:text-white",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
