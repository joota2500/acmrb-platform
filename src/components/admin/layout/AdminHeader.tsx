type Props = {

  title: string;

  description: string;

};

export default function AdminHeader({

  title,

  description,

}: Props) {

  return (

    <div
      className="
        w-full
        min-w-0
      "
    >

      <h1
        className="
          text-3xl
          sm:text-4xl
          lg:text-5xl
          font-black
          text-[#1F2937]
          leading-tight
          tracking-[-0.03em]
          wrap-break-word
        "
      >

        {title}

      </h1>

      <p
        className="
          text-sm
          sm:text-base
          lg:text-lg
          text-zinc-600
          mt-4
          max-w-3xl
          leading-7
          sm:leading-8
          wrap-break-word
        "
      >

        {description}

      </p>

    </div>

  );

}