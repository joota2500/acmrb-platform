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
        p-6
        md:p-10
      "
    >

      <div className="max-w-7xl mx-auto">

        {children}

      </div>

    </main>

  );

}