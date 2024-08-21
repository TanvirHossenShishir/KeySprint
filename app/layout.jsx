import "@/styles/globals.css";

import Nav from "@/components/Nav";
import Provider from "@/components/Provider";

export const metadata = {
  title: "Keyspring",
  description: "Multiplayer typing competition",
};

const RootLayout = ({ children }) => (
  <html lang="en">
    <body>
      <Provider>
        <main>
          <Nav />
          {children}
        </main>
      </Provider>
    </body>
  </html>
);

export default RootLayout;
