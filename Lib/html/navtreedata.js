/*
 @licstart  The following is the entire license notice for the JavaScript code in this file.

 The MIT License (MIT)

 Copyright (C) 1997-2020 by Dimitri van Heesch

 Permission is hereby granted, free of charge, to any person obtaining a copy of this software
 and associated documentation files (the "Software"), to deal in the Software without restriction,
 including without limitation the rights to use, copy, modify, merge, publish, distribute,
 sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all copies or
 substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
 BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

 @licend  The above is the entire license notice for the JavaScript code in this file
*/
var NAVTREE =
[
  [ "Library", "index.html", [
    [ "StreamBuffer examples", "d5/d34/a02809.html", [
      [ "Dynamic creation", "d5/d34/a02809.html#streambuffer_dynamic", null ],
      [ "Static creation", "d5/d34/a02809.html#streambuffer_static", null ],
      [ "Task to task", "d5/d34/a02809.html#streambuffer_task", null ],
      [ "ISR to task (UART receive)", "d5/d34/a02809.html#streambuffer_isr", null ],
      [ "Several writers", "d5/d34/a02809.html#streambuffer_multiwriter", null ],
      [ "Monitoring and control", "d5/d34/a02809.html#streambuffer_monitor", null ],
      [ "Moving ownership", "d5/d34/a02809.html#streambuffer_move", null ]
    ] ],
    [ "Deprecated List", "df/d3b/a00728.html", null ],
    [ "Namespaces", "namespaces.html", [
      [ "Namespace List", "namespaces.html", "namespaces_dup" ],
      [ "Namespace Members", "namespacemembers.html", [
        [ "All", "namespacemembers.html", null ],
        [ "Functions", "namespacemembers_func.html", null ],
        [ "Typedefs", "namespacemembers_type.html", null ],
        [ "Enumerations", "namespacemembers_enum.html", null ],
        [ "Enumerator", "namespacemembers_eval.html", null ]
      ] ]
    ] ],
    [ "Classes", "annotated.html", [
      [ "List", "annotated.html", "annotated_dup" ],
      [ "Index", "classes.html", null ],
      [ "Hierarchy", "hierarchy.html", "hierarchy" ],
      [ "Members", "functions.html", [
        [ "All", "functions.html", "functions_dup" ],
        [ "Functions", "functions_func.html", "functions_func" ],
        [ "Variables", "functions_vars.html", "functions_vars" ],
        [ "Typedefs", "functions_type.html", null ],
        [ "Enumerations", "functions_enum.html", null ],
        [ "Enumerator", "functions_eval.html", null ],
        [ "Related Symbols", "functions_rela.html", null ]
      ] ]
    ] ],
    [ "Files", "files.html", [
      [ "File List", "files.html", "files_dup" ]
    ] ],
    [ "Examples", "examples.html", "examples" ]
  ] ]
];

var NAVTREEINDEX =
[
"annotated.html",
"d0/d3d/a02050.html#a351bf0854e0c48d82c1a078a39e02879",
"d0/daf/a00970.html#a81a065116f1d7643859e4697646c3c10a62f255a0405c1614801a52285695c501",
"d1/d98/a00407.html",
"d2/da6/a01210.html#a441e8d4c01f19d64f498f2dc51f3e28b",
"d3/d50/a00882.html",
"d3/dc4/a01990.html#af83107349f5abc463a7f77aeecb20a20",
"d4/d54/a02218.html#ae95109eada6e1d27cd31567f2ba169deabb1ca97ec761fc37101737ba0aa2e7c5",
"d4/dff/a01910.html#a0b47d84cbdd58474013fe3b38dce4974",
"d5/d8e/a01390.html#a35415de7cf962f29402cef32af19c8cb",
"d5/dfa/a01746.html#a45b3bd4325053ab1288efbf00fd9aebf",
"d6/d51/a01494.html#a14871d2fd0997a7192dbfa9efb391866",
"d7/d1d/a01554.html#ada05318e458485bb7ae8564156216202",
"d7/db7/a02198.html#acdc6aba10abfdf39b35e51b9654d779b",
"d7/dfb/a01966.html#adf02fbd43f1b7d0e8bbd5222bf46f8a7",
"d8/de7/a02030.html#a66f7b610af22e97faef98e233dbd46d5",
"d9/d6e/a02098.html#ab6a8fe4454bba5eff3b40da86531c9c4",
"d9/d9a/a00998.html#ae4ff26d8e2b68bd7157659eaaddd1c91af92e8d24815f45ab685295b8d4d0a442",
"da/d0a/a01526.html#aaf355e4c0c1f6f66b98a952776ce9306",
"da/d79/a01310.html#a753d77f8396c4b45cd0e949461468fa6",
"db/d34/a02118.html#ad0977e4dba5c7109b4b046bcf505862b",
"db/dc2/a02022.html#ad16d5ca2a80de79ba48343d0bfccee65",
"dc/d47/a01510.html#af1bf58d46a2365d039aa946466c931e4ad61484f1331c7f66061e43b859556409",
"dc/def/a01594.html#acdeffbad9eb409804cbc72fa86794a97",
"de/d02/a01026.html#a1b86238c581aff7462e775d7fe6d20a8",
"df/d03/a02058.html#aa5ac1e409b4369f454af973ddb5c7426",
"df/d88/a00962.html#a5d093e457b6ea6877ea0bfccc4007122",
"df/df7/a00731.html#aa079b641f0d5c91c7219aa446879acf2ae3a9e7e16bad82464ec869341753459c"
];

const SYNCONMSG = 'click to disable panel synchronization';
const SYNCOFFMSG = 'click to enable panel synchronization';
const LISTOFALLMEMBERS = 'List of all members';