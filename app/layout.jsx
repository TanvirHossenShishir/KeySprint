import "@/styles/globals.css";

import Nav from "@/components/Nav";
import Provider from "@/components/Provider";

export const metadata = {
  title: "keysprint",
  description: "Multiplayer typing competition",
};

const RootLayout = ({ children }) => (
  <html lang="en">
    <body>
      <Provider>
        <div className="">
          <Nav />
          {children}
        </div>
      </Provider>
    </body>
  </html>
);

export default RootLayout;
