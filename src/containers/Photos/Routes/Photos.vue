<template>
<div>
    <v-progress-circular indeterminate color="primary" v-if="loading" style="margin: 0 auto;"></v-progress-circular>
    <v-layout row wrap v-if="!loading">
        <v-flex xs12>
            <v-btn depressed outline to="/"><v-icon left small>arrow_back</v-icon>Back</v-btn>
            <h2 class="headline">Photos</h2>
        </v-flex>
        <v-flex xs12 class="mt-2">
            <slick-list v-model="items" axis="xy" @sort-end="sortEnd">
                <v-layout row wrap>
                    <slick-item v-for="(item, index) in items" :index="index" :key="index" class="flex mb-3 xs6 sm4 md3">
                        <v-card class="ma-1" style="cursor:pointer;">
                            <v-img :src="item.url" :height="$vuetify.breakpoint.xs ? 'auto' : '225'" contain class="grey darken-3">
                            </v-img>
                            <v-card-title primary-title>
                                <h2 :class="{'body-2': $vuetify.breakpoint.xs, 'headline': !$vuetify.breakpoint.xs}" style="width:100%;">{{ item.pivot.caption[language] }}</h2>
                                <div v-if="item.pivot.tags.length">
                                    <v-chip v-if="tag" v-for="(tag, id) in item.pivot.tags" :key="id" small>{{tag}}</v-chip>
                                </div>
                            </v-card-title>
                            <v-card-actions :style="{display: $vuetify.breakpoint.xs ? 'block' : 'flex'}">
                                <v-btn depressed color="primary" small outline @click="manage(item)">Manage</v-btn>
                                <v-spacer></v-spacer>
                                <v-chip text-color="white" :small="$vuetify.breakpoint.xs" :color="item.pivot.active ? 'success' : 'error'">{{item.pivot.active ? 'Active' : 'Inactive'}}</v-chip>
                            </v-card-actions>
                        </v-card>
                    </slick-item>

                    <v-flex xs6 sm4 md3 class="mb-3">
                        <div class="drop-upload">
                            <input type="file" @change="onFileChange" multiple />
                            <h2 class="body-2 grey--text" :class="{'mt-5': !$vuetify.breakpoint.xs, 'mt-3': $vuetify.breakpoint.xs}">Drag your file(s) here or click to browse</h2>
                            <v-icon color="grey lighten-1" size="60" class="mt-4" :class="{'mb-5': !$vuetify.breakpoint.xs, 'mb-3': $vuetify.breakpoint.xs}">cloud_upload</v-icon>
                            <img :src="image" />
                        </div>
                    </v-flex>
                </v-layout>

                <v-layout row wrap v-if="alert">
                    <v-flex xs12>
                        <v-alert v-model="alert" type="error" dismissible>
                            One or more files did not upload because of the file type. Please use jpg, jpeg, png, or gif files only.
                        </v-alert>
                    </v-flex>
                </v-layout>

            </slick-list>
        </v-flex>
    </v-layout>

    <v-dialog v-if="dialog" v-model="dialog" persistent width="800">
        <v-card class="pa-4">
            <v-img :src="item.url" :height="$vuetify.breakpoint.xs ? 'auto' : '500'" contain>
            </v-img>
            <v-card-text>
                <v-text-field label="Filename" v-model="item.pivot.filename[language]"></v-text-field>
                <v-text-field label="Caption" v-model="item.pivot.caption[language]"></v-text-field>
                <v-switch v-model="item.pivot.active" :label="item.pivot.active ? 'Active' : 'Inactive'"></v-switch>
                <v-select :items="tags" label="Tags" v-model="item.pivot.tags" multiple chips deletable-chips item-text="name" item-value="id">
                </v-select>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="error" depressed @click="delete_dialog = true">Delete Photo</v-btn>
                <v-btn color="error" flat="flat" @click="cancelItem">Cancel</v-btn>
                <v-btn color="success" flat="flat" @click="savePhoto(item)">Save</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <v-dialog v-if="uploading" v-model="uploading" persistent width="450" scrollable>
        <v-card class="pa-3">
            <v-card-title>
                <h2 class="grey--text body-2">UPLOADING</h2>
            </v-card-title>
            <v-list two-line subheader style="max-height:500px;overflow:auto;">
                <v-list-tile v-for="(item, index) in upload_files" :key="item.name" avatar inactive>
                    <v-list-tile-avatar>
                        <v-icon class="grey lighten-1 white--text" :class="item.color == 'primary' ? '' : item.color">{{item.color == 'primary' ? 'cloud_upload' : item.color == 'success' ? 'cloud_done' : 'error'}}</v-icon>
                    </v-list-tile-avatar>

                    <v-list-tile-content>
                        <v-list-tile-title>{{ item.name }}</v-list-tile-title>
                        <v-list-tile-sub-title>
                            <v-progress-linear :indeterminate="item.completed ? false : true" :color="item.color" class="mb-0" height="3" :value="item.completed ? 100 : 0" />
                        </v-list-tile-sub-title>
                    </v-list-tile-content>
                </v-list-tile>
            </v-list>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn v-if="upload_files.every(showUploadCancel)" color="error" flat @click="cancelUpload()">Cancel</v-btn>
                <v-btn :disabled="upload_files[upload_files.length - 1].completed == false" color="primary" flat @click="reloadPhotos()">Reload Photos</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <v-dialog v-if="delete_dialog" v-model="delete_dialog" persistent width="300">
        <v-card class="pa-3">
            <v-card-title>
                <h2>Action Needed</h2>
                <span>Are you sure you want to Delete this photo? This cannot be undone.</span>
            </v-card-title>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="error" flat @click="delete_dialog = false">Cancel</v-btn>
                <v-btn color="success" flat @click="deletePhoto()">Continue</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <v-dialog
        v-model="saving"
        persistent
        width="300"
      >
      <v-card
          color="primary"
          dark
        >
        <v-card-text>
          <v-progress-linear
            indeterminate
            color="white"
            class="mb-0"
          ></v-progress-linear>
        </v-card-text>
        </v-card>
    </v-dialog>
</div>
</template>

<script>
import {
    SlickList,
    SlickItem
} from 'vue-slicksort';

export default {
    routes: [{
        path: '/photos',
        name: 'photos'
    }],
    components: {
        'slick-item': SlickItem,
        'slick-list': SlickList
    },
    data() {
        var self = this;
        return {
            page: {
                title: 'Edit Photos',
                routePrefix: 'units',
            },
            modelName: 'Edit-Photos',
            module: 'PropertyManagement',
            choice: 1,
            language: 'en',
            channel_content_fields: [],
            fields: null,
            validation: {
                valid: false,
            },
            message: '',
            alert: false,
            confirmCancel: false,
            confirm_delete: false,
            dialog: false,
            uploading: false,
            upload_files: [],
            delete_dialog: false,
            tags: [{name: 'Exterior', value: 1}, {name: 'Interior', value: 2}, {name: 'Kitchen', value: 3}],
            item: null,
            saving: false,
            loading: false,
            image: '',
            items: [],
            files: null,
            originalItems: null,
            model: {
                channels: [],
                resort_id: 1
            }
        };
    },
    methods: {
        showUploadCancel(array) {
            return array.color == 'error'
        },
        createFilename(url) {
            const parts = url.split('/');
            const entity = parts[parts.length - 1];
            return entity
        },
        cancelUpload() {
            this.uploading = false
            this.upload_files = []
        },
        reloadPhotos() {
            this.uploading = false
            this.upload_files = []
        },
        onFileChange(e) {
            const files = e.target.files || e.dataTransfer.files;
            if (!files.length)
                return;
            // this.createImage(files);
            this.uploadPhotos(files);
            this.files = files
        },
        createImage(files) {
            const addFile = (file) => {
                if (/\.(jpe?g|png|gif)$/i.test(file.name)) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const img = e.target.result;
                        this.addImage(img)
                    };
                    reader.readAsDataURL(file);
                } else {
                    this.alert = true
                }
            }
            if (files) {
                [].forEach.call(files, addFile);
            }
            this.files = null
        },
        addImage(img) {
            this.items.push({
                url: img,
                filename: "",
                id: '_' + Math.random().toString(36).substr(2, 9),
                pivot: {
                    active: 1,
                    filename: {
                        en: "",
                        fr: ""
                    },
                    tags: [],
                    caption: {
                        en: "",
                        fr: ""
                    },
                    order_column: this.items.length ? this.items[this.items.length - 1].pivot.order_column + 1 : 1
                }
            })
        },
        saveItem() {
            this.dialog = false
            this.saving = true
            setTimeout(() => {
                let id;
                this.items.map((item, index) => {
                    if (item.pivot.order_column == this.item.pivot.order_column) {
                        id = index
                    }
                })
                this.items.splice(id, 1, this.item)
                this.saving = false
                this.item = null
                this.originalItems = JSON.parse(JSON.stringify(this.items))
            }, 2000)
        },
        cancelItem() {
            this.dialog = false
            this.item = null
        },
        manage(item) {
            this.item = JSON.parse(JSON.stringify(item))
            this.dialog = true
        },
        sortEnd(event) {
            setTimeout(() => {
                this.items.forEach((item, index) => {
                    item.pivot.order_column = index + 1
                }, 500)
            })
        },
        reloadPhotos() {
            this.createImage(this.files)
            this.uploading = false
        },
        uploadPhotos(files) {
            const _files = Array.prototype.slice.call(files)
            console.log(_files)
            this.upload_files = []
            _files.map(item => {
                this.upload_files.push({
                    name: item.name,
                    completed: false,
                    color: 'primary'
                })
            })
            this.uploading = true

            let index = 0
            let self = this

            function delayedLog(item) {
                setTimeout(() => {
                    self.upload_files[index].completed = true
                    self.upload_files[index].color = 'success'
                    index += 1
                }, 2000)
            }
            async function processFiles(array) {
                for (const item of array) {
                    await delayedLog(item);
                }
            }
            processFiles(_files);
        },
        deletePhoto() {
            this.dialog = false
            this.delete_dialog = false
            this.saving = true
            setTimeout(() => {
                this.items.filter((photo, index) => {
                    if(photo.id == this.item.id)
                        this.items.splice(index, 1)
                })
                this.saving = false
            }, 2000)
        },
        savePhoto(item) {
            this.dialog = false
            this.delete_dialog = false
            this.saving = true
            setTimeout(() => {
                const photo = this.items.filter(photo => photo.id == item.id)
                const index = this.items.indexOf(photo)
                this.items.splice(index, 1, item)
                this.saving = false
            }, 2000)
        }
    }
}
</script>
<style scoped>
.drop-upload {
    position: relative;
    width: 100%;
    height: 100%;
    border: 5px dashed #cccccc;
    border-radius: 10px;
    text-align: center;
    padding: 25px;
}

.drop-upload input {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
}

@media (max-width: 640px) {
    .drop-upload {
        padding: 5px;
    }
}
</style>
