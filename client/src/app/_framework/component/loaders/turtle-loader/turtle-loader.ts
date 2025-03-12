import { Component, input, inject, OnInit } from '@angular/core';

@Component({
  selector: 'turtle-loader',
  styleUrl: './turtle-loader.scss',
  template: `<div class="loader">
    <div class="box">
      <div class="logo">
        <svg
          width="70"
          height="100"
          viewBox="0 0 70 70"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g filter="url(#filter0_d_40_129)">
            <mask id="path-1-inside-1_40_129" fill="white">
              <path
                d="M10 25C10 11.1929 21.1929 0 35 0V0C48.8071 0 60 11.1929 60 25V25C60 38.8071 48.8071 50 35 50V50C21.1929 50 10 38.8071 10 25V25Z"
              />
            </mask>
            <path
              d="M10 25C10 11.1929 21.1929 0 35 0V0C48.8071 0 60 11.1929 60 25V25C60 38.8071 48.8071 50 35 50V50C21.1929 50 10 38.8071 10 25V25Z"
              fill="url(#paint0_linear_40_129)"
              shape-rendering="crispEdges"
            />
            <path
              d="M10 -1H60V1H10V-1ZM60 50H10H60ZM10 50V0V50ZM60 0V50V0Z"
              fill="#646464"
              mask="url(#path-1-inside-1_40_129)"
            />
            <path
              d="M29 38H41V33.5C41 31.85 40.4125 30.4375 39.2375 29.2625C38.0625 28.0875 36.65 27.5 35 27.5C33.35 27.5 31.9375 28.0875 30.7625 29.2625C29.5875 30.4375 29 31.85 29 33.5V38ZM35 24.5C36.65 24.5 38.0625 23.9125 39.2375 22.7375C40.4125 21.5625 41 20.15 41 18.5V14H29V18.5C29 20.15 29.5875 21.5625 30.7625 22.7375C31.9375 23.9125 33.35 24.5 35 24.5ZM23 41V38H26V33.5C26 31.975 26.3562 30.5438 27.0687 29.2063C27.7812 27.8688 28.775 26.8 30.05 26C28.775 25.2 27.7812 24.1313 27.0687 22.7938C26.3562 21.4563 26 20.025 26 18.5V14H23V11H47V14H44V18.5C44 20.025 43.6437 21.4563 42.9312 22.7938C42.2187 24.1313 41.225 25.2 39.95 26C41.225 26.8 42.2187 27.8688 42.9312 29.2063C43.6437 30.5438 44 31.975 44 33.5V38H47V41H23Z"
              fill="#808080"
            />
          </g>
          <defs>
            <filter
              id="filter0_d_40_129"
              x="0"
              y="-5"
              width="70"
              height="75"
              filterUnits="userSpaceOnUse"
              color-interpolation-filters="sRGB"
            >
              <feFlood flood-opacity="0" result="BackgroundImageFix" />
              <feColorMatrix
                in="SourceAlpha"
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                result="hardAlpha"
              />
              <feOffset dy="10" />
              <feGaussianBlur stdDeviation="5" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.3 0"
              />
              <feBlend
                mode="normal"
                in2="BackgroundImageFix"
                result="effect1_dropShadow_40_129"
              />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="effect1_dropShadow_40_129"
                result="shape"
              />
            </filter>
            <linearGradient
              id="paint0_linear_40_129"
              x1="35"
              y1="50"
              x2="35"
              y2="0"
              gradientUnits="userSpaceOnUse"
            >
              <stop stop-color="#323232" stop-opacity="0.2" />
              <stop offset="1" stop-color="#646464" stop-opacity="0.2" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
    <div class="box"></div>
    <div class="box"></div>
    <div class="box"></div>
    <div class="box"></div>
  </div> `,

  standalone: true,
})
export class TurtleLoader {}
