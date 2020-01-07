<template>
<div>
    <v-progress-linear indeterminate color="primary" class="mb-0" :active="loading" height="2"></v-progress-linear>
    <v-layout row wrap v-if="!loading">
        <v-flex xs12>
            <v-btn @click="openAll()" depressed color="primary" outline>
                <v-icon>unfold_more</v-icon>Open All
            </v-btn>
            <v-btn @click="closeAll()" depressed color="primary" outline>
                <v-icon>unfold_less</v-icon>Close All
            </v-btn>
            <v-text-field class="mb-4" append-icon="search" v-model="search" label="Search Features" single-line hide-details></v-text-field>
            <v-expansion-panel v-model="panel" expand>
                <v-expansion-panel-content v-for="category in filteredItems" :key="category.id" v-if="category.subcategories.length">
                    <template slot="header">
                        <h2 class="title font-weight-light">{{category.name.en}}</h2>
                    </template>
                    <v-card>
                        <v-card-text class="grey lighten-3 px-4">
                            <div v-for="subcategory in category.subcategories" :key="subcategory.id" v-if="subcategory.features.length">
                                <h2 class="subheading font-weight-bold text-uppercase mt-4">{{subcategory.name.en}}</h2>
                                <v-divider class="my-2"></v-divider>
                                <!-- RADIO -->
                                <div v-if="!subcategory.multiselect">
                                    <div v-if="!subcategory.multiselect && complexFeature(item.is_complex_feature) && roomFeature(item.is_room_feature)" v-for="(item, index) in subcategory.features" :key="index" class="mt-3">
                                        <span @click="changeRadio(subcategory, item)" style="cursor:pointer;">
                                            <v-icon color="#82b1ff" v-if="item.enabled">radio_button_checked</v-icon>
                                            <v-icon color="#82b1ff" v-else>radio_button_unchecked</v-icon>
                                            <span class="ml-1" style="font-size:16px;color:rgba(0,0,0,.54);">{{item.name.en}}</span>
                                        </span>
                                    </div>
                                </div>
                                <!-- CHECKBOX -->
                                <v-checkbox v-for="item in subcategory.features" :key='item.id' v-if="subcategory.multiselect && complexFeature(item.is_complex_feature) && roomFeature(item.is_room_feature)" v-model="item.enabled" hide-details
                                    :true-value="1" :false-value="0" :label="item.name.en" @change="save(item)">
                                </v-checkbox>
                            </div>
                        </v-card-text>
                    </v-card>
                </v-expansion-panel-content>
            </v-expansion-panel>
        </v-flex>
    </v-layout>
</div>
</template>

<script>
import categories from './categories.json'
import subcategories from './subcategories.json'
import features from './features.json'

export default {
    props: ['isComplex', 'isRoomFeature', 'resort', 'parent_data'],
    data() {
        return {
            panel: [],
            search: '',
            items: null,
            categories: null,
            subcategories: null,
            loading: false,
            feature_list: null,
            params: {
                start: 1,
                search: '',
                limit: -1,
                sort: 'name',
                dir: 'ASC'
            }
        };
    },
    created() {
        this.loadCategories()
        // this.loadEnabledCategories()
    },
    computed: {
        filteredItems() {
            if (this.categories && this.subcategories && this.items)
                return this.createFeatureList(this.filterList(), true)
        }
    },
    methods: {
        save(item) {
            if (this.resort)
                this.$emit('save', item)
        },
        filterList() {
            let list = this.items
            if (this.search) {
                const self = this
                list = list.filter(item => {
                    var re = new RegExp(self.search, 'gi');
                    return (
                        item.name.en.search(re) >= 0
                    );
                })
            }
            return list
        },
        openAll() {
            this.panel = []
            this.categories.map(item => this.panel.push(true))
        },
        closeAll() {
            this.panel = []
        },
        complexFeature(feature) {
            if (this.isComplex)
                return feature
            return true
        },
        roomFeature(feature) {
            if (this.isRoomFeature)
                return feature
            return true
        },
        changeRadio(sub, item) {
            const features = sub.features.filter(item => item)
            this.items.map((data, index) => {
                const match = features.filter(feature => feature.id == data.id)[0]
                if (match)
                    this.items[index].enabled = 0
                if (item.id == data.id)
                    this.items[index].enabled = 1
            })
            features.map(item => {
                this.save(item)
            })
        },
        createFeatureList(itemData, bool) {
            const categories = this.categories
            const subcategories = this.subcategories
            subcategories.map(sub => {
                const match = itemData.filter(item => item.subcategory_id == sub.id)
                sub.features = match
            })
            categories.map(cat => {
                const match = subcategories.filter(sub => {
                    if (sub.features.length) {
                        return sub.category_id == cat.id
                    }
                })
                cat.subcategories = match
            })
            if (bool)
                return categories
            else
                this.feature_list = categories
        },
        loadCategories() {
            this.categories = categories
            this.loadSubcategories()
        },
        loadSubcategories() {
            this.subcategories = subcategories
            this.loadUnitFeatures()
        },
        loadUnitFeatures() {
            this.loading = true
            this.items = features
            this.items.forEach((item, index) => {
                //Enable on front-end
                if (item.enabled_feature)
                    item.enabled = item.enabled_feature.enabled
                //is not Complex feature
                if(!item.is_complex_feature && this.isComplex)
                    delete this.items[index]
                //is not Room feature
                if(!item.is_room_feature && this.isRoomFeature)
                    delete this.items[index]
                //if parent_data from complex or unit
                if(this.parent_data) {
                    const match = this.parent_data.filter(data => data.id == item.id)[0]
                    if(match) {
                        item.enabled = 1
                        //Custom name
                        if(match.pivot) {
                            if(match.pivot.customized_name) {
                                for(const prop in match.pivot.customized_name) {
                                    item.custom_name[prop] = match.pivot.customized_name[prop]
                                }
                            }
                        }
                    }
                    else {
                        item.enabled = 0
                    }
                }
            })
            this.createFeatureList(this.items)
            this.loading = false
        }
    }
}
</script>
