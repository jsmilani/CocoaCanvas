Cocoa Canvas
=============
Cocoa Canvas is designed to be the MVC foundation for HTML5 Canvas applications. It is modeled after the Apple's Cocoa API for rapid development and ease-of-use. It utilizes existing javascript event handling and Canvas drawing, but adds a view hierarchy with event propagation. This API is under development and only the working features are documented.

Development Note
-----------------
The API is splint into modules. Only the 'Core' module is available at this time. The other modules sets will be mentioned, but no documentation is available.

Core (cocoa-canvas.js)
-----------------------
The Core module includes CCApplication and CCView (CCWindow is present, but windowing support is not yet available). Event support is limited to mouse event propagation and basic dragging. This module is enough to build mouse based games with custom views.

UI (under development)
-----------------------
The UI module extends the API with Control and Text fields.

Proposed Feature Sets
----------------------
* Networking
* Documents
* 