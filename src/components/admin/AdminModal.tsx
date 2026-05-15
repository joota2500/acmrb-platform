type Props = {
  open: boolean;
  onClose: () => void;
};

export default function AdminModal({
  open,
  onClose,
}: Props) {

  if (!open) return null;

  return (
    <div
      className="
        fixed
        inset-0
        z-[9999]
        bg-black/80
        backdrop-blur-xl
        flex
        items-center
        justify-center
        px-6
      "
    >

      <div
        className="
          relative
          w-full
          max-w-md
          rounded-[40px]
          border
          border-white/10
          bg-[#04130c]/90
          backdrop-blur-2xl
          p-10
          overflow-hidden
        "
      >

        <div
          className="
            absolute
            top-0
            left-1/2
            -translate-x-1/2
            w-72
            h-72
            bg-green-500/10
            blur-3xl
            rounded-full
          "
        />

        <button
          onClick={onClose}
          className="
            absolute
            top-6
            right-6
            text-zinc-400
            hover:text-white
            transition
            text-2xl
          "
        >
          ×
        </button>

        <div className="relative">

          <div className="text-center">

            <div
              className="
                w-20
                h-20
                rounded-3xl
                bg-green-500
                flex
                items-center
                justify-center
                text-black
                text-3xl
                font-black
                mx-auto
              "
            >
              A
            </div>

            <h2 className="
              text-white
              text-3xl
              font-black
              mt-6
            ">
              Área Administrativa
            </h2>

            <p className="
              text-zinc-400
              mt-4
              leading-relaxed
            ">
              Plataforma institucional ACMRB
            </p>

          </div>

          <form className="mt-10 space-y-6">

            <div>

              <label className="
                block
                text-sm
                text-zinc-400
                mb-3
              ">
                Email institucional
              </label>

              <input
                type="email"
                placeholder="admin@acmrb.org"
                className="
                  w-full
                  h-14
                  rounded-2xl
                  bg-white/5
                  border
                  border-white/10
                  px-5
                  text-white
                  outline-none
                  focus:border-green-500
                  transition
                "
              />

            </div>

            <div>

              <label className="
                block
                text-sm
                text-zinc-400
                mb-3
              ">
                Senha
              </label>

              <input
                type="password"
                placeholder="••••••••"
                className="
                  w-full
                  h-14
                  rounded-2xl
                  bg-white/5
                  border
                  border-white/10
                  px-5
                  text-white
                  outline-none
                  focus:border-green-500
                  transition
                "
              />

            </div>

            <button
              type="submit"
              className="
                w-full
                h-14
                rounded-2xl
                bg-green-500
                hover:bg-green-400
                transition
                text-black
                font-black
                text-lg
              "
            >
              Entrar
            </button>

          </form>

        </div>

      </div>

    </div>
  );
}