<script setup lang="ts">
import { defineEmits, defineModel ,ref} from 'vue';
import { Attachment } from '@/modules/attachments/types';
import type { FileUploadUploaderEvent } from 'primevue/fileupload'
import { useToast } from 'primevue/usetoast'



const toast = useToast()
const attachment = defineModel('Attachment', {
  type: Attachment,
  default: new Attachment()
})
const emits = defineEmits<{
  valider: [] // named tuple syntax
}>()

const submitted = ref(false);

const visible = defineModel('visible', {
  type: Boolean,
  default: false
});


const handleSave = () => {
  emits('valider');
  visible.value = false; 
};

const uploadFileAttachment = async (event: FileUploadUploaderEvent) => {
  const file = event.files instanceof Array?event.files[0]:event.files
  let formData = new FormData()
  formData.append('file', file) // inputFile est l'élément input de type file

  try {
   // await importFileContactApi(formData)
    toast.add({
      severity: 'success',
      summary: 'Successful',
      detail: 'File uploaded, contact has been created',
      life: 3000
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Faillure',
      detail: 'Error during uploading file',
      life: 3000
    })
  }
  //await loadLazyData()
}

</script>

<template>
  <Dialog
    v-model:visible="visible"
    :style="{ width: '450px' }"
    header="Attachment  Details"
    :modal="true"
    class="p-fluid"
  >
    <div class="field">
      <label for="name">Titre du Attachment</label>
      <InputText
        id="name"
        v-model.trim="attachment.name"
        required="true"
        autofocus
        :class="{ 'p-invalid': submitted && !attachment.name }"
      />
      <small class="p-error" v-if="submitted && !attachment.name">le titre is required.</small>
    </div>


    <div class="field">
      <label for="filename">fichier</label>
      <Toast/>
      <div>
        <Toast />
        <FileUpload  v-model.trim="attachment.filename" customUpload @uploader="uploadFileAttachment" @before-upload="()=>{}" :multiple="true" accept="image/*, .pdf, .docx, audio/*, .csv" :maxFileSize="1000000">
            <template #empty>
                <p> Veuillez selection votre fichier</p>
            </template>
        </FileUpload>
      </div>
    </div>
  
    


    
    <template #footer>
      <Button label="Cancel" severity="danger" icon="pi pi-times" text @click="visible = false" />
      <Button label="Save" severity="success" icon="pi pi-check" text @click="handleSave" />
    </template>
  </Dialog>
</template>
