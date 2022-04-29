# Three.js Voxel Generation
I built this as a boredom project, but basically it uses simplex noise to generate a voxel world.

The generation code is extremely slow but it generates in such a manner that rendering is less expensive. Need to work on it more later, possibly put the generation code in its own thread/web worker or make it generate on a server, and just render client side.

# Contributing
Please follow all ESLint guidelines. Aside from that, have fun!

Use `yarn dev` to run the dev server.

# License
This project is licensed under the [MIT License](LICENSE) &copy; 2022-CURRENT Elizabeth Ainslie