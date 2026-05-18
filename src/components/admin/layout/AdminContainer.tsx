type Props = {

  children: React.ReactNode;

};

export default function AdminContainer({

  children,

}: Props) {

  return (

    <div
      className="
        min-h-screen
        bg-[#F5F7F4]
        flex
        flex-col
        lg:flex-row
        overflow-x-hidden
      "
    >

      {children}

    </div>

  );

}