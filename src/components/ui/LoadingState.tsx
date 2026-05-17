type Props = {
  text?: string;
};

export default function LoadingState({
  text = "Carregando...",
}: Props) {

  return (

    <div
      className="
        bg-white
        rounded-4xl
        border
        border-black/5
        p-16
        text-center
      "
    >

      <div
        className="
          w-14
          h-14
          border-4
          border-zinc-200
          border-t-[#2E5E4E]
          rounded-full
          animate-spin
          mx-auto
        "
      />

      <p className="text-zinc-500 mt-6">

        {text}

      </p>

    </div>

  );

}