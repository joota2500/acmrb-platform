type Props = {

  children: React.ReactNode;

};

export default function AdminContent({

  children,

}: Props) {

  return (

    <main
      className="
        flex-1
        min-w-0
        w-full
        overflow-x-hidden
        px-4
        py-5
        sm:px-6
        sm:py-6
        lg:px-8
        lg:py-8
        xl:px-10
      "
    >

      <div
        className="
          w-full
          max-w-7xl
          mx-auto
        "
      >

        {children}

      </div>

    </main>

  ); 

}