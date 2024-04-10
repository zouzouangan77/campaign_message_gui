<!-- eslint-disable vue/multi-word-component-names -->

<template>
    <div class="card">
        <Stepper orientation="vertical">
            <StepperPanel header="Campagne Message">
                <template #content="{ nextCallback }">
                    <div class="flex flex-column h-12rem">
                        <div class="border-2 border-dashed surface-border border-round surface-ground flex-auto flex justify-content-center align-items-center font-medium">
                            Ce projet utilise Playwright pour effectuer des tests automatisés sur des navigateurs web.</div>
                    </div>
                    <div class="flex py-4">
                        <Button label="Suivant" @click="nextCallback" />
                    </div>
                </template>
            </StepperPanel>
            <StepperPanel header="Prérequis">
                <template #content="{ prevCallback, nextCallback }">
                    <div class="flex flex-column h-12rem">
                        <div class="border-2 border-dashed surface-border border-round surface-ground flex-auto flex justify-content-center align-items-center font-medium">
                            - Node.js version >= 16 doit être installé sur votre système. Vous pouvez télécharger Node.js depuis [le site officiel](https://nodejs.org/). </div>
                    </div>
                    <div class="flex py-4 gap-2">
                        <Button label="Retour" severity="secondary" @click="prevCallback" />
                        <Button label="Suivant" @click="nextCallback" />
                    </div>
                </template>
            </StepperPanel>
            <StepperPanel header="Installation des navigateurs pour Playwright">
                <template #content="{ prevCallback, nextCallback }">
                    <div class="flex flex-column h-12rem">
                        <div class="border-2 border-dashed surface-border border-round surface-ground flex-auto flex justify-content-center align-items-center font-medium">
                            Avant de lancer le programme, vous devez installer les navigateurs pour Playwright en utilisant la commande suivante : <br> <br>

                            ```bash <br>
                            npx playwright install <br>
                            ``` <br> <br>

                            Cette commande téléchargera et installera les navigateurs nécessaires pour Playwright (Chromium, Firefox et WebKit) dans votre environnement.
                        </div>
                    </div>
                    <div class="flex py-4 gap-2">
                        <Button label="Retour" severity="secondary" @click="prevCallback" />
                        <Button label="Suivant" @click="nextCallback" />
                    </div>
                </template>
            </StepperPanel>
            <StepperPanel header="Lancement du Programme">
                <template #content="{ prevCallback, nextCallback }">
                    <div class="flex flex-column h-12rem">
                        <div class="border-2 border-dashed surface-border border-round surface-ground flex-auto flex justify-content-center align-items-center font-medium">
                            <TabView>
                                <TabPanel header="Sur Windows">
                                    <p class="m-0">
                                        Pour lancer le programme sur Windows, exécutez le fichier `start.cmd`. Assurez-vous que Node.js est installé sur votre système et que les navigateurs pour Playwright ont été installés à l'étape précédente. <br> <br>

                                        ```bash <br>
                                        start.cmd <br>
                                        ```

                                    </p>
                                </TabPanel>
                                <TabPanel header="Sur Linux">
                                    <p class="m-0">
                                        Pour lancer le programme sur Linux, exécutez le fichier `start.sh`. Assurez-vous que Node.js est installé sur votre système et que les navigateurs pour Playwright ont été installés à l'étape précédente. <br> <br>

                                        ```bash <br>
                                        ./start.sh <br>
                                        ```
                                    </p>
                                </TabPanel>
                                
                            </TabView>
                        </div>
                    </div>
                    <div class="flex py-4 gap-2">
                        <Button label="Retour" severity="secondary" @click="prevCallback" />
                        <Button label="Suivant" @click="nextCallback" />
                    </div>
                </template>
            </StepperPanel>
            <StepperPanel header="packaging projet ">
                <template #content="{ prevCallback }">
                    <div class="flex flex-column h-12rem">
                        <div class="border-2 border-dashed surface-border border-round surface-ground flex-auto flex justify-content-center align-items-center font-medium">
                            ```bash <br>
                            tar -czvf campaign_message_gui.tar.gz dist node_modules package.json pnpm-lock.yaml start.cmd start.sh README.md .env <br>
                            tar -xzvf campaign_message_gui.tar.gz -C campaign_message_gui <br>
                            ```
                        </div>
                    </div>
                    <div class="flex py-4">
                        <Button label="Retour" severity="secondary" @click="prevCallback" />
                    </div>
                </template>
            </StepperPanel>
        </Stepper>
    </div>
</template>




<script setup lang="ts"></script>

<style></style>
  