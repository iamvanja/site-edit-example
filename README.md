# site-edit-example

Example on how to use the Portal's routes to input a single injected ad and save all injected ads.

Please keep in mind that this is a PoC. As such:
- we do not check the originating domain (the fact that user has to have a valid session in the portal should be enough, but...)
- real implementation on the Boomerang end should probably handle duplicates (this one does not)
- button to save all injected ads should probably be disabled if there are no ads already added
- various
