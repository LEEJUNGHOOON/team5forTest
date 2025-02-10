import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { createRecord } from 'lightning/uiRecordApi';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';

import LEAFLET_ZIP from '@salesforce/resourceUrl/LeafletJS';

import LEAD_OBJECT from '@salesforce/schema/Lead';
import NAME_FIELD from '@salesforce/schema/Lead.LastName';
import COMPANY_FIELD from '@salesforce/schema/Lead.Company';
import ADDRESS_FIELD from '@salesforce/schema/Lead.Add__c';
import LATITUDE_FIELD from '@salesforce/schema/Lead.Latitude__c';
import LONGITUDE_FIELD from '@salesforce/schema/Lead.Longitude__c';
import CONFIRMED_FIELD from '@salesforce/schema/Lead.Confirmed__c';

export default class LeadMap extends LightningElement {
    @api recordId;
    @track latitude;
    @track longitude;
    @track address = '';
    @track company = '';
    @track isChecked = false;
    map;
    marker;

    renderedCallback() {
        if (this.map) return;

        // Leaflet CDN을 사용하여 로드
        Promise.all([
            loadStyle(this, LEAFLET_ZIP + '/leaflet.css'),
            loadScript(this, LEAFLET_ZIP + '/leaflet.js')
        ])
        .then(() => {
            console.log('✅ Leaflet.js 로드 성공');
            this.initMap();
        })
        .catch(error => {
            console.error('❌ Leaflet.js 로드 실패:', error);
            this.dispatchEvent(new ShowToastEvent({
                title: 'Error',
                message: '지도 라이브러리를 불러올 수 없습니다.',
                variant: 'error'
            }));
        });
    }

    initMap() {
        console.log('✅ 지도 초기화 시작');
        const mapContainer = this.template.querySelector('.map-container');

        if (!mapContainer) {
            console.error('❌ 지도 컨테이너를 찾을 수 없습니다.');
            return;
        }

        this.map = L.map(mapContainer).setView([37.5665, 126.9780], 14);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(this.map);

        this.map.on('click', async (event) => {
            this.latitude = event.latlng.lat;
            this.longitude = event.latlng.lng;
            console.log(`📌 지도 클릭됨 - 위도: ${this.latitude}, 경도: ${this.longitude}`);

            if (this.marker) {
                this.marker.remove();
            }

            this.marker = L.marker([this.latitude, this.longitude]).addTo(this.map);
            await this.getAddressFromLatLng(this.latitude, this.longitude);
        });
    }

    async getAddressFromLatLng(lat, lng) {
        try {
            console.log(`📌 Reverse Geocoding 실행 - 위도: ${lat}, 경도: ${lng}`);
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            if (!response.ok) {
                throw new Error(`❌ HTTP 오류: ${response.status}`);
            }

            const data = await response.json();
            this.address = data.display_name || '주소를 찾을 수 없습니다.';
            console.log(`✅ 변환된 주소: ${this.address}`);
        } catch (error) {
            console.error('❌ 주소 변환 실패:', error);
            this.address = '주소를 찾을 수 없습니다.';
        }
    }

    handleCompanyChange(event) {
        this.company = event.target.value;
    }

    handleCheckboxChange(event) {
        this.isChecked = event.target.checked;
    }

    handleSave() {
        if (!this.company || !this.address || !this.latitude || !this.longitude) {
            this.dispatchEvent(new ShowToastEvent({
                title: 'Error',
                message: '회사명, 주소, 위도, 경도를 모두 입력해야 합니다!',
                variant: 'error'
            }));
            return;
        }

        const fields = {};
        fields[NAME_FIELD.fieldApiName] = 'New Lead';
        fields[COMPANY_FIELD.fieldApiName] = this.company;
        fields[ADDRESS_FIELD.fieldApiName] = this.address;
        fields[LATITUDE_FIELD.fieldApiName] = this.latitude;
        fields[LONGITUDE_FIELD.fieldApiName] = this.longitude;
        fields[CONFIRMED_FIELD.fieldApiName] = this.isChecked;

        createRecord({ apiName: LEAD_OBJECT.objectApiName, fields })
            .then((lead) => {
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Success',
                    message: `Lead 생성 완료 (ID: ${lead.id})`,
                    variant: 'success'
                }));
            })
            .catch(error => {
                console.error('❌ Lead 생성 실패:', error);
            });
    }
}